/** @jsxImportSource @emotion/react */ // 최상단에 배치
"use client";

import { useSearchParams } from "next/navigation";
import { InstantSearch, SearchBox, useInfiniteHits, useSearchBox } from "react-instantsearch";
import { SearchBoxWrap } from "./SearchStyle";
import { css } from "@emotion/react";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { collection, doc, getDoc, Timestamp } from "firebase/firestore";
import { db } from "@/app/DB/firebaseConfig";
import BookmarkBtn from "@/app/components/BookmarkBtn";
import { NoMorePost, PostWrap } from "@/app/styled/PostComponents";
import { DidYouLogin, loadingState, loginToggleState, modalState, PostData, UsageLimitState, UsageLimitToggle } from "@/app/state/PostState";
import { searchClient } from "@/app/utils/algolia";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { motion } from "framer-motion";
import { useHandleUsernameClick } from "@/app/utils/handleClick";
import { btnVariants } from "@/app/styled/motionVariant";
import { cleanHtml } from "@/app/utils/CleanHtml";
import LoadingWrap from "@/app/components/LoadingWrap";
import { useDelPost } from "../post/hook/useNewPostMutation";

const formatDate = (createAt: Timestamp | Date | string | number) => {
    if ((createAt instanceof Timestamp)) {
        return createAt.toDate().toLocaleString('ko-KR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        }).replace(/\. /g, '.');
    } else {
        const date = new Date(createAt);

        const format = date.toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        })
        return format;
    }
}

// Hit 컴포넌트 정의

function CustomInfiniteHits() {
    const { query } = useSearchBox(); // 검색어 상태 가져오기
    const { items, showMore, isLastPage } = useInfiniteHits<PostData>();

    // 검색어가 없을 때
    if (!query.trim()) {
        return <NoMorePost>
            <div className="no_more_icon" css={css`background-image : url(https://res.cloudinary.com/dsi4qpkoa/image/upload/v1744966539/%EA%B2%80%EC%83%89%ED%95%B4%EC%A4%98_r6cgmi.svg)`}></div>
            <p>검색어를 입력 해주세요.</p>
            <span>사용자나 아이디 또는 메모 제목을 검색 해보세요.</span>
        </NoMorePost>;
    }

    // 검색 결과가 없을 때
    if (items.length === 0) {
        return <NoMorePost>
            <div className="no_more_icon" css={css`background-image : url(https://res.cloudinary.com/dsi4qpkoa/image/upload/v1744966539/%EA%B2%80%EC%83%89%EC%97%86%EC%96%B4_w1msj0.svg)`}></div>
            <p>&apos;{query}&apos;에 대한 검색결과 없음.</p>
            <span className="no_result_span">다른 용어를 검색해 보거나 검색어가 정확한지 확인해 보세요.</span>
        </NoMorePost>;
    }

    return (
        <div className="ais_infinite_result_wrap">
            {items.map((hit) => (
                <PostHit key={hit.objectID} hit={hit} />
            ))}
            {!isLastPage && (
                <button onClick={showMore}>더 보기</button>
            )}
        </div>
    );
}




function PostHit({ hit }: { hit: PostData }) {
    const [userData, setUserData] = useState<{ displayName: string; photoURL: string | null } | null>(null);
    const [loading, setIsLoading] = useState<boolean>(true);
    const setLoading = useSetRecoilState<boolean>(loadingState);
    const yourLogin = useRecoilValue(DidYouLogin);
    const setLoginToggle = useSetRecoilState<boolean>(loginToggleState);
    const setModal = useSetRecoilState<boolean>(modalState);
    const usageLimit = useRecoilValue<boolean>(UsageLimitState);
    const setLimitToggle = useSetRecoilState<boolean>(UsageLimitToggle);
    const [dropToggle, setDropToggle] = useState<string>('');

    const router = useRouter();
    const dropdownRef = useRef<HTMLDivElement>(null);
    // 포스트 보기
    const handlePostClick = (postId: string) => { // 해당 포스터 페이지 이동
        console.log(postId, '검색 페이지 이동 포스트 ID');
        if (!yourLogin || usageLimit) {
            if (usageLimit) {
                return setLimitToggle(true);
            }
            if (!yourLogin) {
                setLoginToggle(true);
                setModal(true);
                return;
            }
        }
        router.push(`memo/${postId}`)
    }

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const userDoc = await getDoc(doc(collection(db, 'users'), hit.userId));
                if (userDoc.exists()) {
                    const user = userDoc.data() as { displayName: string; photoURL: string | null };
                    setUserData(user);
                }
            } catch (error) {
                console.error('Error fetching user data:', error);
            } finally {
                setIsLoading(false);
                setLoading(false);
            }
        };

        fetchUserData();
    }, [hit.userId]);

    const handleUsernameClick = useHandleUsernameClick();

    const { mutate: handledeletePost } = useDelPost();
    // 포스트 삭제
    const deletePost = async (postId: string) => {
        const confirmed = confirm('게시글을 삭제 하시겠습니까?')
        if (!confirmed) return;
        handledeletePost(postId)
    }

    if (!userData) {
        return <p>User not found</p>;
    }

    return (
        <>
            {!loading &&
                <motion.div
                    whileHover={{
                        backgroundColor: "#fafbfc",
                        transition: { duration: 0.1 },
                    }}
                    key={hit.objectID as string}
                    className='post_box'
                >
                    {/* 작성자 프로필 */}
                    <div className='post_profile_wrap'>
                        <div className='user_profile'>
                            <div className='user_photo'
                                css={css`background-image : url(${userData.photoURL})`}
                            >
                            </div>
                            <p className='user_name'
                                onClick={(e) => { e.preventDefault(); handleUsernameClick(hit.userId); }}
                            >
                                {userData.displayName}
                            </p>
                            <span className='user_uid'>
                                @{hit.userId.slice(0, 6)}...
                            </span>
                            <p className='post_date'>
                                · {formatDate(hit.createAt)}
                            </p>
                        </div>
                        <div className='post_dropdown_wrap' ref={dropdownRef}>
                            <motion.button
                                variants={btnVariants}
                                whileHover="iconWrapHover"
                                whileTap="iconWrapClick"
                                className='post_drop_menu_btn'
                                aria-label='포스트 옵션 더보기'
                                css={css`background-image : url(https://res.cloudinary.com/dsi4qpkoa/image/upload/v1736451404/%EB%B2%84%ED%8A%BC%EB%8D%94%EB%B3%B4%EA%B8%B0_obrxte.svg)`}
                                onClick={(event) => { event.preventDefault(); event.stopPropagation(); setDropToggle((prev) => (prev === hit.objectID as string ? '' : hit.objectID as string)); }}
                            >
                                {dropToggle === hit.objectID as string &&
                                    <div>
                                        <ul>
                                            <li className='post_drop_menu'>
                                                <motion.button
                                                    variants={btnVariants}
                                                    whileHover="otherHover"
                                                    onClick={(event) => { event.preventDefault(); event.stopPropagation(); deletePost(hit.objectID as string); }} className='post_dlt_btn'>게시글 삭제</motion.button>
                                            </li>
                                        </ul>
                                    </div>
                                }
                            </motion.button>
                        </div>
                    </div>
                    {/* 포스트 내용 */}
                    <div className='post_content_wrap' onClick={(event) => { event.preventDefault(); handlePostClick(hit.objectID as string); }}>
                        {/* 포스트 제목 */}
                        < div className='post_title_wrap' >
                            <span className='post_tag'>[{hit.tag}]</span>
                            <h2 className='post_title'>{hit.title}</h2>
                        </div>
                        <div className='post_text' dangerouslySetInnerHTML={{ __html: cleanHtml(hit.content) }}></div>
                        {/* 이미지 */}
                        {(hit.images && hit.images.length > 0) && (
                            <div className='post_pr_img_wrap'>
                                {hit.images.map((imageUrl, index) => (
                                    <div className='post_pr_img' key={index}
                                        css={css
                                            `
                                  background-image : url(${imageUrl});
                                  width: calc((100% / ${Array.isArray(hit.images) && hit.images.length}) - 4px);
                                  `}
                                    ></div>
                                ))}
                            </div>
                        )}

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
                                <p>{hit.commentCount}</p>
                            </div>
                            <BookmarkBtn postId={hit.objectID as string}></BookmarkBtn>
                        </div>
                    </div>
                </motion.div >
            }
            {loading && <LoadingWrap />}
        </>
    );
}


const CustomSearch = () => {
    const { refine } = useSearchBox(); // Algolia 검색 상태를 업데이트하는 함수
    const searchParams = useSearchParams();
    const query = searchParams?.get('query') || '';
    const router = useRouter();

    const handleSearch = (event: React.KeyboardEvent<HTMLDivElement>) => {
        // 엔터키를 감지
        if (event.key === 'Enter') {
            const inputElement = event.target as HTMLInputElement;

            // input 요소에서 검색어를 가져옴
            const query = inputElement.value.trim();

            if (query) {
                // 검색어가 비어있지 않다면 'home/search'로 이동
                router.push(`/home/search?query=${encodeURIComponent(query)}`);
            }
        }
    };

    useEffect(() => {
        if (query.trim() !== '') {
            refine(query); // 검색어가 있을 때만 refine 호출
        }
    }, [query, refine]);


    useEffect(() => {
        refine(query); // 검색어를 Algolia의 상태로 설정
    }, [query, refine]);

    return (
        <SearchBox placeholder="검색" defaultValue={query} searchAsYouType={false} onKeyDown={(event) => handleSearch(event)} />
    );
};

export default function SearchClient() {
    const searchParams = useSearchParams();
    const query = searchParams?.get('query') || '';
    const setLoading = useSetRecoilState<boolean>(loadingState);

    useEffect(() => {
        console.log(query)
        setLoading(false)
    }, [])
    return (
        <InstantSearch searchClient={searchClient} indexName="post_index">
            <PostWrap>
                <SearchBoxWrap>
                    <div className="search_bar">
                        <div className="search_input_wrap">
                            <CustomSearch></CustomSearch>
                            <CustomInfiniteHits />
                        </div>
                    </div>
                    <div className="post_result">
                    </div>
                </SearchBoxWrap>
            </PostWrap>
        </InstantSearch>
    )
}