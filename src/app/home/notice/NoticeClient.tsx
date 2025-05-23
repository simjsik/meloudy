/** @jsxImportSource @emotion/react */ // 최상단에 배치
"use client";

import { fetchNoticePosts } from "@/app/utils/fetchPostData";
import { DidYouLogin, loadingState, loginToggleState, modalState, PostData, UsageLimitState, UsageLimitToggle, userState } from "@/app/state/PostState";
import { NoMorePost, NoticeWrap, } from "@/app/styled/PostComponents";
import { css } from "@emotion/react";
import { InfiniteData, useInfiniteQuery } from "@tanstack/react-query";
import { Timestamp } from "firebase/firestore";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState, } from "react";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import { motion } from "framer-motion";
import LoadingWrap from "@/app/components/LoadingWrap";
import { useHandleUsernameClick } from "@/app/utils/handleClick";
import { btnVariants } from "@/app/styled/motionVariant";
import { formatDate } from "@/app/utils/formatDate";

export default function ClientNotice() {
    const yourLogin = useRecoilValue(DidYouLogin)
    const setLoginToggle = useSetRecoilState<boolean>(loginToggleState)
    const setModal = useSetRecoilState<boolean>(modalState);
    const setLimitToggle = useSetRecoilState<boolean>(UsageLimitToggle)
    const [usageLimit, setUsageLimit] = useRecoilState<boolean>(UsageLimitState)
    const [dataLoading, setDataLoading] = useState<boolean>(false);
    const [loading, setLoading] = useRecoilState(loadingState);

    // 포스트 스테이트

    // 현재 로그인 한 유저
    const currentUser = useRecoilValue(userState)

    const router = useRouter();
    const pathName = usePathname();
    const observerLoadRef = useRef(null);
    const uid = currentUser.uid

    // 무한 스크롤 로직
    const {
        data: notices,
        fetchNextPage,
        hasNextPage,
        isLoading,
        isError,
    } = useInfiniteQuery<
        { data: PostData[]; nextPage: Timestamp | undefined }, // TQueryFnData
        Error, // TError
        InfiniteData<{ data: PostData[]; nextPage: Timestamp | undefined }>,
        string[], // TQueryKey
        Timestamp | undefined // TPageParam
    >({
        retry: false,
        queryKey: ['notices'],
        queryFn: async ({ pageParam }) => {
            try {
                setDataLoading(true);

                const validateResponse = await fetch(`/api/validate`, {
                    method: "POST",
                    credentials: "include",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ uid }),
                });
                if (!validateResponse.ok) {
                    const errorDetails = await validateResponse.json();
                    throw new Error(`포스트 요청 실패: ${errorDetails.message}`);
                }

                return fetchNoticePosts(uid as string, pageParam);
            } catch (error) {
                if (error instanceof Error) {
                    console.error("일반 오류 발생:", error.message);
                    throw error;
                } else {
                    console.error("알 수 없는 에러 유형:", error);
                    throw new Error("알 수 없는 에러가 발생했습니다.");
                }
            } finally {
                setDataLoading(false);
            }
        },
        getNextPageParam: (lastPage) => lastPage.nextPage,
        staleTime: 5 * 60 * 1000,
        initialPageParam: undefined,
    });

    const noticeList = notices?.pages.flatMap(page => page.data) || [];

    // 스크롤 끝나면 포스트 요청
    useEffect(() => {

        if (!yourLogin || usageLimit) {
            if (usageLimit) {
                setLimitToggle(true);
                setModal(true);
            }
            if (!yourLogin) {
                setLoginToggle(true);
                setModal(true);
            }
            return;
        }

        if (!hasNextPage || !observerLoadRef.current) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) {
                    fetchNextPage(); // ✅ hasNextPage가 true일 때만 실행
                }
            },
            { threshold: 1.0 }
        );

        observer.observe(observerLoadRef.current);
        return () => observer.disconnect();

    }, [hasNextPage, fetchNextPage]);

    // 포스트 보기
    const handlePostClick = (postId: string) => { // 해당 포스터 페이지 이동
        if (usageLimit) {
            return setLimitToggle(true);
        }
        router.push(`memo/${postId}`)
    }

    // 에러 발생 시 데이터 요청 중지
    useEffect(() => {
        if (isError) {
            setUsageLimit(true);
        }
    }, [isError])

    // 초기 데이터 로딩
    useEffect(() => {
        if (!isLoading) {
            setLoading(false); // 초기 로딩 해제
        }
    }, [isLoading, setLoading])

    useEffect(() => {
        // 페이지 진입 시 스크롤 위치 복원
        const savedScroll = sessionStorage.getItem(`scroll-${pathName}`);

        if (savedScroll) {
            window.scrollTo(0, parseInt(savedScroll, 10));
        }

        // 페이지 이탈 시 스크롤 위치 저장
        const saveScrollPosition = () => {
            sessionStorage.setItem(`scroll-${pathName}`, window.scrollY.toString());
            history.go(-1);
        };

        // 새로고침 및 창닫기 시 스크롤 위치 제거
        const resetScrollPosition = () => {
            sessionStorage.setItem(`scroll-${pathName}`, '0');
        };


        // 뒤로가기로 페이지 이탈 시 스크롤 위치 저장
        window.addEventListener('popstate', saveScrollPosition);
        window.addEventListener('beforeunload', resetScrollPosition);

        // 클린업
        return () => {
            window.removeEventListener('beforeunload', resetScrollPosition);
            window.removeEventListener('popstate', saveScrollPosition);
        };
    }, [pathName]);

    const handleUsernameClick = useHandleUsernameClick();
    return (
        <>
            <NoticeWrap>
                <>
                    {/* 무한 스크롤 구조 */}
                    {!loading && noticeList.map((post) => (
                        <motion.div
                            key={post.id} className='post_box'
                            whileHover={{
                                backgroundColor: "#fafbfc",
                                transition: { duration: 0.1 },
                            }}
                        >
                            {/* 작성자 프로필 */}
                            <div className='post_profile'>
                                <div className='user_profile'
                                    css={css`background-image : url(${post.photoURL})`}
                                ></div>
                                <p className='user_name'
                                    onClick={(e) => { e.preventDefault(); handleUsernameClick(post.userId); }}
                                >
                                    {post.displayName}
                                </p>
                                <span className='user_uid'>
                                    @{post.userId.slice(0, 6)}...
                                </span>
                                <p className='post_date'>
                                    · {formatDate(post.createAt)}
                                </p>
                            </div>
                            {/* 포스트 내용 */}
                            <div className='post_content_wrap' onClick={(event) => { event.preventDefault(); handlePostClick(post.id); }}>
                                {/* 포스트 제목 */}
                                <div className='post_title_wrap'>
                                    <span className='post_tag'>{post.tag}</span>
                                    <p className='post_title' >{post.title}</p>
                                </div>
                                <div className="post_text" dangerouslySetInnerHTML={{ __html: post.content }}></div>
                                {/* 이미지 */}
                                {(post.images && post.images.length > 0) &&
                                    <div className='post_pr_img_wrap'>
                                        {post.images.map((imageUrl, index) => (
                                            <div className='post_pr_img'
                                                key={index}
                                                css={
                                                    css`
                                                    background-image : url(${imageUrl});
                                                    width: calc((100% / ${Array.isArray(post.images) && post.images.length}) - 4px);
                                                    `}>
                                            </div>
                                        ))}
                                    </div>
                                }
                                {/* 포스트 댓글, 북마크 등 */}
                                <div className='post_bottom_wrap'>
                                    <div className='post_comment'>
                                        <motion.button
                                            variants={btnVariants}
                                            whileHover="iconWrapHover"
                                            whileTap="iconWrapClick" className='post_comment_btn'>
                                            <motion.div
                                                variants={btnVariants}
                                                whileHover="iconHover"
                                                whileTap="iconClick" className='post_comment_icon'>
                                            </motion.div>
                                        </motion.button>
                                        <p>{post.commentCount}</p>
                                    </div>
                                </div>
                            </div>

                        </motion.div>
                    ))}
                    <div ref={observerLoadRef} css={css`height: 1px; visibility: ${dataLoading ? "hidden" : "visible"};`} />
                    {(!loading && dataLoading) && <LoadingWrap />}
                    {(!dataLoading && !hasNextPage && !loading) &&
                        <>
                            {
                                noticeList.length > 0 ?
                                    <NoMorePost>
                                        <div className="no_more_icon" css={css`background-image : url(https://res.cloudinary.com/dsi4qpkoa/image/upload/v1744966540/%EA%B3%B5%EC%A7%80%EB%8B%A4%EB%B4%A4%EC%96%B4_lbmtbv.svg)`}></div>
                                        <p>모두 확인했습니다.</p>
                                        <span>전체 공지사항을 전부 확인했습니다.</span>
                                    </NoMorePost>
                                    :
                                    <NoMorePost>
                                        <div className="no_more_icon" css={css`background-image : url(https://res.cloudinary.com/dsi4qpkoa/image/upload/v1744966540/%EA%B3%B5%EC%A7%80%EC%97%86%EC%96%B4_xkphgs.svg)`}></div>
                                        <p>모두 확인했습니다.</p>
                                        <span>공지사항이 없습니다.</span>
                                    </NoMorePost>
                            }
                        </>
                    }
                </>
            </NoticeWrap>
        </>
    )
}