/** @jsxImportSource @emotion/react */ // 최상단에 배치
"use client"
import { ReactNode, useEffect } from "react";
import { PretendardBold, PretendardLight, PretendardMedium } from "@/app/styled/FontsComponets";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RecoilRoot, useRecoilValue, useSetRecoilState } from "recoil";
import "./globals.css";
import useAuthSync from "./hook/AuthSyncHook";
import { bookMarkState, userState } from "./state/PostState";
import { doc, getDoc } from "firebase/firestore";
import { db } from "./DB/firebaseConfig";
import { usePostUpdateChecker } from "./hook/ClientPolling";
import { usePathname } from "next/navigation";

const queryClient = new QueryClient();

function InitializeLoginComponent({ children }: { children: ReactNode }) {
    const { clearUpdate } = usePostUpdateChecker();

    const currentUser = useRecoilValue(userState);
    const setCurrentBookmark = useSetRecoilState<string[]>(bookMarkState)
    const pathName = usePathname();
    const loadBookmarks = async (uid: string) => {
        try {
            console.log('북마크 데이터 요청')
            const bookmarks = await getDoc(doc(db, `users/${uid}/bookmarks/bookmarkId`));
            console.log(bookmarks.exists(), '북마크 유무');
            if (bookmarks.exists()) {
                // 북마크 데이터가 있을 경우
                const data = bookmarks.data() as { bookmarkId: string[] };
                setCurrentBookmark(data.bookmarkId); // Recoil 상태 업데이트
                console.log(data.bookmarkId, '북마크 리스트 목록');
            }
        } catch (error) {
            console.error("북마크 데이터를 가져오는 중 오류 발생:", error);
            setCurrentBookmark([]);
        }
    }

    useAuthSync();

    useEffect(() => {
        loadBookmarks(currentUser.uid);
    }, [])

    useEffect(() => {
        console.log(currentUser.uid)
        clearUpdate();
    }, [currentUser, pathName])
    return <>{children}</>; // 반드시 children을 렌더링
}

export default function ProviderClient({ children }: { children: ReactNode }) {
    return (
        <div className={`${PretendardLight.variable} ${PretendardMedium.variable} ${PretendardBold.variable}`}>
            <QueryClientProvider client={queryClient}>
                <RecoilRoot>
                    <InitializeLoginComponent>
                        <>
                            {children}
                        </>
                    </InitializeLoginComponent>
                </RecoilRoot>
            </QueryClientProvider>
        </div>
    );
}