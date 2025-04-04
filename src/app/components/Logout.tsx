/** @jsxImportSource @emotion/react */ // 최상단에 배치
"use client";

import { useRecoilState, useSetRecoilState } from "recoil";
import { bookMarkState, DidYouLogin, loginToggleState, modalState, PostData, userBookMarkState, userData, userState } from "../state/PostState";
import { css } from "@emotion/react";
import { signOut } from "firebase/auth";
import { auth } from "../DB/firebaseConfig";
import { motion } from "framer-motion";
import { btnVariants } from "../styled/motionVariant";

const LogoutButton = css`
    position : absolute;
    bottom: 20px;
    width : calc(100% - 40px);
    height : 52px;
    background : #fff;
    color : #191919;
    border : 1px solid #ededed;
    border-radius : 4px;
    font-size : 16px;
    font-family : var(--font-pretendard-medium)
    cursor : pointer;
`
const LogInButton = css`
    position : absolute;
    bottom: 20px;
    width : calc(100% - 40px);
    height : 52px;
    background : #0087ff;
    color : #fff;
    border : none;
    border-radius : 4px;
    font-size : 16px;
    font-family : var(--font-pretendard-medium)
    cursor : pointer;
`
export default function Logout() {
    const [hasLogin, setHasLogin] = useRecoilState<boolean>(DidYouLogin)
    const [user, setUser] = useRecoilState<userData>(userState)
    const setLoginToggle = useSetRecoilState<boolean>(loginToggleState)
    const setModal = useSetRecoilState<boolean>(modalState);
    const setCurrentBookmark = useSetRecoilState<string[]>(bookMarkState)
    const setUserCurrentBookmark = useSetRecoilState<PostData[]>(userBookMarkState)
    // State


    // hook

    const handleLogout = async () => {
        try {
            const confirmed = confirm('로그아웃 하시겠습니까?')
            if (confirmed && user) {
                const response = await fetch(`/api/logout`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json", 'Project-Host': window.location.origin },
                    credentials: 'include',
                });

                if (!response.ok) {
                    const errorData = await response.json()
                    console.log('로그아웃 실패 :', errorData.message)
                }

                await signOut(auth);

                setUser({
                    name: null,
                    email: null,
                    photo: null,
                    uid: '', // uid는 빈 문자열로 초기화
                }); // 로그아웃 상태로 초기화
                setCurrentBookmark([])
                setUserCurrentBookmark([])
                setHasLogin(false)
            }
        } catch (error) {
            console.error("로그아웃 에러:", error);
            alert("로그아웃 시도 중 에러가 발생했습니다..");
        }
    }

    const handleLoginToggle = () => {
        setLoginToggle(true);
        setModal(true);
    }

    // Function
    return (
        <>
            {(hasLogin) ?
                <div>
                    <motion.button
                        variants={btnVariants}
                        whileHover="otherHover"
                        whileTap="otherClick"
                        onClick={handleLogout} css={LogoutButton}>로그아웃</motion.button>
                </div>
                :
                <motion.button
                    variants={btnVariants}
                    whileHover="loginHover"
                    whileTap="loginClick"
                    onClick={handleLoginToggle} css={LogInButton}>로그인</motion.button>
            }
        </>
    )
}