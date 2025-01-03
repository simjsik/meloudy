/** @jsxImportSource @emotion/react */ // 최상단에 배치
'use client';
import { useState } from "react";
import { css } from "@emotion/react";
import { useRecoilState, useSetRecoilState } from "recoil";
import { DidYouLogin, loginToggleState, userData, userState } from "../state/PostState";
import loginListener from "../hook/LoginHook";
import {
    CreateButton,
    GoogleButton,
    GuestButton,
    LoginButtonWrap,
    LoginInput,
    LoginInputWrap,
    NaverButton,
    OtherLoginWrap
} from "../styled/LoginComponents";
import { getAuth, signInWithCustomToken, signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../DB/firebaseConfig";
import { LoginOr, LoginSpan, LoginTitle } from "../styled/LoginStyle";
import { useRouter } from "next/navigation";

const LoginWrap = css`
position : fixed;
left : 0;
width : 100%;
height : 100vh;
z-index : 5;
`

const LoginBg = css`
width : 100%;
height : 100%;
background : rgba(0,0,0,0.8);
`

const PopupLoginWrap = css`
left : 50%;
right : auto;
transform: translate(-50%, -50%);
`

const LoginButton = css`
width: 100%;
height : 52px;
margin-top : 20px;
border : none;
border-radius : 4px;
background : #272D2D;
color: #fff;
font-size : 16px;
font-family : var(--font-pretendard-medium);
`
export default function LoginBox() {
    const setLoginToggle = useSetRecoilState<boolean>(loginToggleState)
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [user, setUser] = useRecoilState<userData | null>(userState)
    const [hasLogin, setHasLogin] = useRecoilState<boolean>(DidYouLogin)
    // State
    const auths = getAuth();
    const router = useRouter();
    loginListener();
    // hook

    const handleGuest = () => {
        setLoginToggle(false);
    }

    const handleLogin = async (email: string, password: string) => {
        try {

            const userCredential = await signInWithEmailAndPassword(auths, email, password);
            const user = userCredential.user;
            if (user) {
                const response = await fetch("/api/auth/loginApi", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ email, password }),
                });

                const customToken = await response.json();

                if (response.ok) {
                    const userCredential = await signInWithCustomToken(auths, customToken);

                    const userData = userCredential.user
                    const idToken = await userCredential.user.getIdToken();

                    if (idToken) {
                        // 서버에 ID 토큰 전달하여 쿠키 저장 요청
                        await fetch("/api/utils/validateAuthToken", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            credentials: "include", // 쿠키를 요청 및 응답에 포함
                            body: JSON.stringify({ idToken }),
                        });
                    }

                    setUser({
                        name: userData.displayName,
                        email: userData.email,
                        photo: userData.photoURL,
                        uid: userData.uid,
                    });

                    setHasLogin(true);
                    setLoginToggle(false);
                    alert("Login successful!");
                    router.push('/home/main')
                } else {
                    alert("Login failed. Please check your credentials.");
                }
            }
        } catch (error) {
            console.error("Error during login:", error);
            alert("An error occurred during login.");
            return;
        }
    }

    // Function
    return (
        <div css={LoginWrap}>
            <div css={LoginBg} onClick={() => setLoginToggle(false)}></div>
            <LoginButtonWrap css={PopupLoginWrap}>
                <LoginTitle>로그인</LoginTitle>
                <form onSubmit={(e) => { e.preventDefault(); handleLogin(email, password); }}>
                    <LoginInputWrap>
                        <div>
                            <p>이메일 또는 아이디</p>
                            <LoginInput type="email" placeholder='' value={email} onChange={(e) => setEmail(e.target.value)} />
                        </div>
                        <div>
                            <p>패스워드</p>
                            <LoginInput type="password" placeholder='' value={password} onChange={(e) => setPassword(e.target.value)} />
                        </div>
                    </LoginInputWrap>
                    <LoginSpan>처음 이신가요?</LoginSpan >
                    <CreateButton>회원가입</CreateButton>
                    <button type="submit" css={LoginButton}>로그인</button>
                </form>
                <OtherLoginWrap>
                    <LoginOr>또는</LoginOr>
                    <div>
                        <GoogleButton>Google 계정으로 로그인</GoogleButton>
                        <NaverButton>네이버 계정으로 로그인</NaverButton>
                        <GuestButton onClick={handleGuest}>게스트 로그인</GuestButton>
                    </div>
                </OtherLoginWrap>
            </LoginButtonWrap>
        </div >
    )
}