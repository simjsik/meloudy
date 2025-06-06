import ClientBookmark from './ClientBookmark'
import { BookmarkWrap } from '@/app/styled/PostComponents';

export const metadata = {
    title: "MEMOME :: 북마크",
    description: "북마크된 메모를 확인해보세요.",
};

export default async function Bookmark() {

    return (
        <>
            <BookmarkWrap>
                <ClientBookmark />
            </BookmarkWrap>
        </>
    )
}