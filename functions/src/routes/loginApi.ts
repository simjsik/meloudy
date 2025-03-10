import dotenv from "dotenv";
dotenv.config();
import express, {Request, Response} from "express";
import {adminAuth, adminDb} from "../DB/firebaseAdminConfig";
import cookieParser from 'cookie-parser';
import jwt from 'jsonwebtoken';

const router = express.Router();
const app = express();
app.use(cookieParser());

const API_URL = process.env.API_URL;
const secret = process.env.JWT_SECRET;

router.post('/login', async (req: Request, res: Response) => {
    try {
        const {idToken, role, hasGuest, guestUid} = await req.body;
        const randomName =
         `Guest-${Math.random().toString(36).substring(2, 6)}`;
        console.log(idToken.slice(0, 8), '유저 아이디 토큰 ( Login API )');
        let decodedToken;
        let uid;
        let userSession;
        let tokenResponse;

        if (guestUid) {
            if (!idToken) return res.status(403).json({message: "게스트 토큰 누락"});
            decodedToken = await adminAuth.verifyIdToken(idToken);
            uid = decodedToken.uid;

            const guestDocRef = adminDb.doc(`guests/${guestUid}`);
            const guestDoc = await guestDocRef.get();

            if (!guestDoc.exists) {
                const customToken = await adminAuth.createCustomToken(uid);

                const saveUserResponse = await fetch(`${API_URL}/saveUser`, {
                    method: "POST",
                    headers: {"Content-Type": "application/json"},
                    body: JSON.stringify({
                        uid, displayName: randomName, token: customToken,
                    }),
                });

                if (!saveUserResponse.ok) {
                    const errorData = await saveUserResponse.json();
                    throw new Error(`${403}: ${errorData.error}`);
                }
            } else {
                const idToken = await guestUid.getIdToken();
                if (!idToken) {
                    return res.status(403).json({
                         message: "게스트 토큰이 유효하지 않습니다.",
                        });
                }

                decodedToken = await adminAuth.verifyIdToken(idToken);
                if (!decodedToken) {
                    return res.status(403).json({
                         message: "게스트 계정이 올바르지 않습니다.",
                         });
                }

                uid = decodedToken.uid;
            }

            // 서버로 ID 토큰 검증을 위해 전송
            tokenResponse = await fetch(`${API_URL}/validate`, {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({idToken}),
            });
        } else {
            decodedToken = await adminAuth.verifyIdToken(idToken);
            if (!decodedToken) {
                return res.status(403).json({message: "계정 토큰이 올바르지 않습니다."});
            }

            uid = decodedToken.uid;

            tokenResponse = await fetch(`${process.env.API_URL}/validate`, {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({idToken}),
            });
        }

        if (!secret) {
            console.error("JWT 비밀 키 확인 불가");
            return res.status(403).json({message: "JWT 비밀 키 확인 불가."});
        }

        const userToken = jwt.sign({uid, role}, secret, {expiresIn: "1h"});

        if (!tokenResponse?.ok) {
            const errorData = await tokenResponse?.json();
            console.error("토큰 인증 실패:", errorData.message);
            return res.status(403).json({message: "토큰 인증 실패."});
        }

        if (hasGuest) {
            userSession = {
                uid: uid,
                name: decodedToken.name || randomName,
                photo: decodedToken.picture || "",
                email: decodedToken.email || "",
                role: role,
            };
        } else {
            userSession = {
                uid: uid,
                name: decodedToken.name || "",
                photo: decodedToken.picture || "",
                email: decodedToken.email || "",
                role: role,
            };
        }

        const CsrfResponse = await fetch(`${process.env.API_URL}/csrf`, {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            credentials: "include",
            body: JSON.stringify({uid}),
        });

        if (!CsrfResponse.ok) {
            const errorData = await CsrfResponse.json();
            console.error("CSRF 토큰 발급 실패:", errorData.message);
            return res.status(403).json({message: "CSRF 토큰 발급 실패."});
        }

        const {csrfToken} = await CsrfResponse.json();
        console.log(csrfToken, 'csrf 토큰 ( login API )');

        res.cookie("csrfToken", csrfToken, {
            domain: "memome-delta.vercel.app",
            httpOnly: true,
            secure: true,
            sameSite: "lax",
            path: "/",
            maxAge: 3600 * 1000,
        });

        res.cookie("authToken", idToken, {
            domain: "memome-delta.vercel.app",
            httpOnly: true,
            secure: true,
            sameSite: "lax",
            path: "/",
            maxAge: 3600 * 1000,
        });

        res.cookie("userToken", userToken, {
            domain: "memome-delta.vercel.app",
            httpOnly: true,
            secure: true,
            sameSite: "lax",
            path: "/",
            maxAge: 3600 * 1000,
        });

        res.cookie("hasGuest", hasGuest, {
            domain: "memome-delta.vercel.app",
            httpOnly: true,
            secure: true,
            sameSite: "lax",
            path: "/",
            maxAge: 3600 * 1000,
        });

        return res.status(200).json({
            message: "로그인 성공.",
            uid,
            user: userSession,
        });
    } catch (error) {
        console.error("Login error:", error);
        if (error === "auth/user-not-found") {
            return res.status(404).json({message: "User not found"});
        } else if (error === "auth/wrong-password") {
            return res.status(401).json({message: "Incorrect password"});
        }
        return res.status(500).json({message: "Login failed"});
    }
});

export default router;
