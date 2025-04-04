/** @jsxImportSource @emotion/react */ // 최상단에 배치
"use client";

import styled from '@emotion/styled';
import Logout from './Logout';
import MemoStatus from './status/MemoStatus';
import { useParams, usePathname, } from 'next/navigation';
import UserProfile from './status/UserProfile';
import SearchComponent from './SearchComponent';

const PostListWrap = styled.div`
position : fixed;
top: 40px;
right : 160px;
width : 400px;
height: calc(100vh - 80px);
padding : 0px 20px;
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
`

export default function StatusBox() {
    const path = usePathname();
    const params = useParams<{ postId: string }>();
    const postId = params?.postId || ''

    // Function
    return (
        <>
            {path !== '/home/post' &&
                <PostListWrap >
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
                </PostListWrap >
            }
        </>
    )
}