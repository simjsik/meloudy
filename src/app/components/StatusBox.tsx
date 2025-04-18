/** @jsxImportSource @emotion/react */ // 최상단에 배치
"use client";

import styled from '@emotion/styled';
import Logout from './Logout';
import MemoStatus from './status/MemoStatus';
import { useParams, usePathname, } from 'next/navigation';
import UserProfile from './status/UserProfile';
import SearchComponent from './SearchComponent';
import { useMediaQuery } from "react-responsive";
import { statusState } from '../state/PostState';
import { css } from '@emotion/react';
import { useRecoilState } from 'recoil';
import { motion } from "framer-motion";
import { btnVariants } from '../styled/motionVariant';
import { useRef } from 'react';
import useOutsideClick from '../hook/OutsideClickHook';

const PostListWrap = styled.div`
position : fixed;
top: 40px;
right: clamp(80px, calc((100vw - 1200px) * 0.6), 420px);
width : 400px;
height: 80%;
padding : 20px;
border : 1px solid #ededed;
border-radius : 8px;
background : #fff;

.list_top{
position: relative;
display : flex;
justify-content: space-between;
width: 100%;
height: 100%;
padding: 10px 0px 96px;
}

.list_toggle {
width : 48px;
height : 48px;
border : none;
background : gray;
border-radius : 4px;
cursor : pointer;
}

  @media (max-width: 768px) {
    position: absolute;
    z-index: 10;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
  }

  @media (min-width: 1921px) {
    border-left: 2px solid #ededed;
    border-right: 2px solid #ededed;
    width: 500px;
    max-height : 2000px;
    right: clamp(320px, calc(320px + (100vw - 1920px) * 0.4375), 600px);
  }

  @media (min-width: 2560px) {
    width: 600px;
    padding : 28px;
    right: clamp(500px, calc(500px + (100vw - 2560px) * 0.3125), 900px);
  }

  @media (min-width: 3840px) {
    border-left: 3px solid #ededed;
    border-right: 3px solid #ededed;
    width: 680px;
    padding : 32px;
    right: clamp(920px, calc(920px + (100vw - 3840px) * 0.3125), 1320px);
  }
    
  @media (min-width: 5120px) {
    width: 760px;
    padding : 36px;
    right: clamp(1420px, calc(1420px + (100vw - 5120px) * 0.3125), 100vw);
  }
`

export default function StatusBox() {
    const path = usePathname();
    const params = useParams<{ postId: string }>();
    const postId = params?.postId || ''
    const isMobile = useMediaQuery({ maxWidth: 1200 });
    const [mobileStatus, setMobileStatus] = useRecoilState<boolean>(statusState);
    // Function
    const statusRef = useRef<HTMLDivElement>(null);

    // 768 상태 창 핸들러
    const statusHandle = () => {
        setMobileStatus((prev) => !prev);
    }

    // 외부 클릭 시 드롭다운 닫기
    useOutsideClick(statusRef, () => {
        if (mobileStatus) {
            setMobileStatus(false);
        }
    });
    return (
        <>

            {path !== '/home/post' &&
                <>
                    {(isMobile && mobileStatus) &&
                        <div css={css`position : fixed; left: 0; top: 0; bottom : 0; right : 0; z-index : 1; background:rgba(0,0,0,0.7);`}>
                            <PostListWrap ref={statusRef} >
                                <SearchComponent></SearchComponent>
                                {
                                    path !== `/home/memo/${params?.postId}` && <UserProfile></UserProfile >
                                }
                                <div className='list_top'>
                                    {
                                        path === `/home/memo/${params?.postId}` && <MemoStatus post={postId} />
                                    }
                                </div>
                                <Logout></Logout>
                                <motion.button css={
                                    css`position : absolute;
                                            bottom: 20px;
                                            width : calc(100% - 40px);
                                            height : 52px;
                                            background : #fff;
                                            color : #191919;
                                            border : 1px solid #ededed;
                                            border-radius : 4px;
                                            font-size : 1rem;
                                            font-family : var(--font-pretendard-medium);
                                            cursor : pointer;`
                                }
                                    variants={btnVariants}
                                    whileHover="otherHover"
                                    whileTap="otherClick"
                                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); statusHandle(); }}>취소</motion.button>
                            </PostListWrap>
                        </div>
                    }
                    {!isMobile && <PostListWrap>
                        <SearchComponent></SearchComponent>
                        {
                            path !== `/home/memo/${params?.postId}` && <UserProfile></UserProfile >
                        }
                        <div className='list_top'>
                            {
                                path === `/home/memo/${params?.postId}` && <MemoStatus post={postId} />
                            }
                        </div>
                        <Logout></Logout>
                    </PostListWrap>
                    }
                </>
            }
        </>
    )
}