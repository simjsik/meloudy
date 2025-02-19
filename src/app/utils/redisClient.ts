import dotenv from 'dotenv';
dotenv.config();
import { createClient } from "redis";
import jwt, { JwtPayload } from 'jsonwebtoken';

interface SessionData {
    name: string;
    photo: string;
    email: string,
    role: number;
    [key: string]: string | number;
}

const JWT_SECRET = process.env.JWT_SECRET; // JWT 비밀키

const redisClient = createClient({
    url: `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`,
});

// Redis 클라이언트 연결
redisClient.connect().catch((err) => {
    console.log(`Connecting to Redis at ${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`);
    console.error("Redis 연결 실패:", err);
});

export default redisClient;

// 세션 저장 함수
export async function saveSession(uid: string, data: SessionData) {
    const key = `session:${uid}`;
    // console.log(data, '세션 저장 유저 정보')
    await redisClient.set(key, JSON.stringify(data), { EX: 3600 * 24 * 7 }); // 일주일 만료
}

// 세션 업데이트 함수
export async function updateSession(uid: string, data: SessionData) {
    const key = `session:${uid}`;
    // console.log(data, '세션 업데이트 유저 정보')
    await redisClient.set(key, JSON.stringify(data), { XX: true, KEEPTTL: true });
}

// 게스트 세션 저장 함수
export async function saveGuestSession(uid: string, data: SessionData) {
    const key = `session:${uid}`;
    // console.log(data, '게스트 세션 저장 유저 정보')
    await redisClient.set(key, JSON.stringify(data), { EX: 3600 * 24 }); // 1시간 만료
}

// 세션 가져오기 함수
export async function getSession(uid: string): Promise<SessionData | null> {
    const key = `session:${uid}`;
    const data = await redisClient.get(key);
    return data ? JSON.parse(data) : null;
}

// 세션 조회
export async function sessionExists(uid: string): Promise<boolean> {
    const key = `session:${uid}`;
    const exists = await redisClient.exists(key);
    // console.log(uid, exists, '세션 저장 유저 정보 조회')
    return exists === 1;
}

// 세션 삭제 함수
export async function deleteSession(uid: string) {
    const key = `session:${uid}`;
    await redisClient.del(key);
}

// 유저 인증 함수
export async function authenticateUser(token: string): Promise<boolean | string> {
    try {
        if (JWT_SECRET) {
            // Step 1: JWT 검증 및 uid 추출
            const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;

            if (!decoded && typeof decoded !== 'object' && 'uid' in decoded && 'role' in decoded) {
                console.error('JWT 구조가 올바르지 않습니다.');
                return false;
            }

            const uid = decoded.uid as string;

            // Redis에서 세션 조회
            const sessionKey = `session:${uid}`;
            const userSession = await redisClient.get(sessionKey);

            if (!userSession) {
                console.error('Redis 세션 없음 또는 만료됨.');

                const response = await fetch('http://localhost:3000/api/utils/logoutDeleteToken', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                })
                if (!response.ok) {
                    const errorDetails = await response.json();
                    throw new Error(`로그아웃 실패: ${errorDetails.message}`);
                }

                return false;
            }

            return uid;
        }
        return false;
    } catch (error) {
        console.error('JWT 구조가 올바르지 않습니다.', error);
        return false;
    }
}

export function generateJwt(uid: string, role: number): string {
    const secret = process.env.JWT_SECRET;

    if (!secret) {
        throw new Error('JWT_SECRET is not defined');
    }

    return jwt.sign({ uid: uid, role: role }, secret, { expiresIn: "1h" });
}