import { atom } from "recoil"

export interface PostData {
    tag: string;
    title: string;
    id: string;
    userId: string;
    content: string;
    images?: string[];
    createAt: any;
    commentCount: number,
    notice: boolean,
}

export interface Comment {
    id: string
    replyId: string;
    user: string;
    commentText: string;
    createAt: any;
    localTimestamp: any;
    replies: Comment[];
    parentId: string | null;
}

export interface memoList {
    list:
    {
        tag: string,
        id: string,
        title: string,
        images: string[],
        createAt: any,
    }[],
    user: string
}

export interface BookmarkPostData {
    tag: string;
    id: string;
    title: string;
    userId: string;
    comment: number;
    createAt: any;
}

// 관리자 아이디
export const ADMIN_ID = atom<string>({
    key: 'ADMIN_USER_ID',
    default: '8KGNsQPu22Mod8QrXh6On0A8R5E2'
})

// 포스트 업로드 시 입력한 내용
export const PostingState = atom<string>({
    key: 'PostingState',
    default: ''
})

// firebase에 저장된 포스트 데이터
export const PostState = atom<PostData[]>({
    key: 'PostState',
    default: []
})

// 로그인 유무 확인
export const DidYouLogin = atom<boolean>({
    key: 'DidYouLogin',
    default: false
})
// 공지사항 스테이트
export const noticeState = atom<boolean>({
    key: 'noticeState',
    default: false
})

// 유저 ID
export const userState = atom<string | null>({
    key: 'userState',
    default: null
})

// 로그인 창 토글
export const loginToggleState = atom<boolean>({
    key: 'loginToggleState',
    default: false
})

// 포스트 보기 스타일 토글
export const postStyleState = atom<boolean>({
    key: 'postStyleState',
    default: true,
})

// 로컬 스토리지 내용 확인 없으면 false
export const storageLoadState = atom<boolean>({
    key: 'storageLoadState',
    default: false,
})

// 포스트 페이지 입장 시 상태 창에 현재 작성자의 모든 포스트 데이터
export const memoState = atom<memoList>({
    key: 'memoState',
    default: {
        list: [
            {
                tag: '',
                id: '',
                title: '',
                images: [],
                createAt: '',
            }
        ],
        user: ''
    },
})

// 포스트 댓글
export const memoCommentState = atom<Comment[]>({
    key: 'memoCommentState',
    default: [],
})

// 새 공지사항 알림 토글
export const newNoticeState = atom<boolean>({
    key: 'newNoticeState',
    default: false,
})
