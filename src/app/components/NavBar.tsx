/** @jsxImportSource @emotion/react */ // 최상단에 배치
"use client";
import styled from '@emotion/styled';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { selectedMenuState } from '../state/LayoutState';
import { usePathname, useRouter } from 'next/navigation';
import { DidYouLogin, loginToggleState, newNoticeState, noticeState, searchState, UsageLimitState, UsageLimitToggle, userData, userState } from '../state/PostState';
import { useEffect } from 'react';
import { css } from '@emotion/react';
import SearchComponent from './SearchComponent';

const NavBarWrap = styled.div`
position: fixed;
top: 0;
left: 0;
width: 80px;
height : 100%;
background: #fff;

&>div{
position: relative;
top: 50%;
transform: translateY(-50%);
}
`
const NavMenu = styled.div<{ isActive: boolean }>`
display : flex;
flex-direction: column;
align-items: center;
width : 48px;
height : 48px;
margin : 0 auto;
margin-top: 20px;
border-radius : 8px;
cursor: pointer;

.post_alarm{
position : absolute;
right: 10px;
width :6px;
height : 6px;
border-radius : 50%;
}

.menu_icon {
width : 40px;
height : 40px;
margin-top: 4px;
}

.menu_p{
font-size : 12px;
color : ${(props) => props.isActive ? '#191919' : '#acacac'};
font-family : ${(props) => (props.isActive && 'var(--font-pretendard-bold)')};
line-height : 20px;
}

.menu_underbar{
width: 70%;
height: 2px;
}

&:hover{
background : #f9f9f9;
}
`

export default function NavBar() {
    const yourLogin = useRecoilValue(DidYouLogin)
    const setLoginToggle = useSetRecoilState<boolean>(loginToggleState)
    const [selectedMenu, setSelectedMenu] = useRecoilState<string>(selectedMenuState);
    const [currentUser, setCurrentUser] = useRecoilState<userData | null>(userState)
    const [newNotice, setNewNotice] = useRecoilState<boolean>(newNoticeState);
    const [notice, setNotice] = useRecoilState<boolean>(noticeState);
    const [searchToggle, setSearchToggle] = useRecoilState<boolean>(searchState)
    const [usageLimit, setUsageLimit] = useRecoilState<boolean>(UsageLimitState)
    const [limitToggle, setLimitToggle] = useRecoilState<boolean>(UsageLimitToggle)


    // State
    const router = useRouter();
    const path = usePathname();

    useEffect(() => {
        if (path) {
            const pathSegment = path?.split('/').filter(Boolean);
            if (pathSegment[1] === 'main') {
                setSelectedMenu('allPost');
            } else if (pathSegment[1] === 'bookmark') {
                setSelectedMenu('bookmark');
            }
        }
    }, [path])

    // 내비 클릭 시 선택 메뉴 설정
    const handleNavClick = (NavTitle: string) => {
        if (NavTitle === 'allPost') {
            router.push('/home/main');
            setNotice(false);
        } else if (NavTitle === 'bookmark') {
            if (yourLogin) {
                router.push(`/home/bookmark/${currentUser}`);
                setNotice(false);
            } else {
                return alert('로그인이 필요한 기능입니다.');
            }
        } else if (NavTitle === 'notice') {
            router.push('/home/main');
            setNotice(true);
            setNewNotice(false);
        }
        setSelectedMenu(NavTitle);
    }

    // 포스팅 메뉴 클릭 시 이동 및 제어
    const handlePosting = () => {
        if (yourLogin && !usageLimit) {
            router.push('/home/post');
        } else if (usageLimit) {
            return setLimitToggle(true);
        } else {
            setLoginToggle(true);
        }
    };

    const handleSearch = () => {
        if (yourLogin && !usageLimit) {
            setSearchToggle(true)
        } else if (usageLimit) {
            return setLimitToggle(true);
        } else {
            setLoginToggle(true);
        }
    };


    // Function
    return (
        <>
            <NavBarWrap>
                <div>
                    {/* 공지사항 */}
                    <NavMenu isActive={'notice' === selectedMenu} onClick={() => handleNavClick('notice')}>
                        <div className='post_alarm' css={css`${newNotice ? 'background : red' : 'background : none'}`}></div>
                        <div className='menu_icon'>
                            {'notice' === selectedMenu ?

                                <svg width="40" height="40" viewBox="0 0 40 40">
                                    <g>
                                        <path className='notice_path_01' d="M29.55,26.26,28.36,25a1.14,1.14,0,0,1-.3-.77V19.26a8.29,8.29,0,0,0-7-8.32,8.09,8.09,0,0,0-9.14,8v5.23a1.14,1.14,0,0,1-.3.77l-1.19,1.31a1.72,1.72,0,0,0,1.26,2.87H28.29A1.72,1.72,0,0,0,29.55,26.26Z" fill="#050505" />
                                        <path className='notice_path_02' d="M17.51,29.13a.34.34,0,0,0-.35.37,2.86,2.86,0,0,0,5.68,0,.34.34,0,0,0-.35-.37Z" fill="#050505" />
                                        <circle cx="20" cy="10" r="2" fill="#050505" />
                                        <rect width="40" height="40" fill="none" />
                                    </g>
                                </svg>
                                :
                                <svg width="40" height="40" viewBox="0 0 40 40">
                                    <g>
                                        <path className='notice_path_01' d="M29.55,26.26,28.36,25a1.14,1.14,0,0,1-.3-.77V19.26a8.29,8.29,0,0,0-7-8.32,8.09,8.09,0,0,0-9.14,8v5.23a1.14,1.14,0,0,1-.3.77l-1.19,1.31a1.72,1.72,0,0,0,1.26,2.87H28.29A1.72,1.72,0,0,0,29.55,26.26Z" fill="none" stroke='#ccc' strokeWidth={'2'} />
                                        <path className='notice_path_02' d="M17.51,29.13a.34.34,0,0,0-.35.37,2.86,2.86,0,0,0,5.68,0,.34.34,0,0,0-.35-.37Z" fill="none" stroke='#ccc' strokeWidth={'2'} />
                                        <circle cx="20" cy="9.15" r="1.15" fill="none" stroke='#ccc' strokeWidth={'2'} />
                                        <rect width="40" height="40" fill="none" />
                                    </g>
                                </svg>
                            }

                        </div>
                    </NavMenu>

                    {/* 메인 / 전체 포스트 */}
                    <NavMenu isActive={'allPost' === selectedMenu} onClick={() => handleNavClick('allPost')}>
                        <div className='post_alarm'></div>
                        <div className='menu_icon'>
                            {'allPost' === selectedMenu ?
                                <svg width="40" height="40" viewBox="0 0 40 40">
                                    <g>
                                        <path d="M17.524,9.65,7.642,18.462A2.4,2.4,0,0,0,7,20.144v8.6a2.217,2.217,0,0,0,2.118,2.3h4.765A2.217,2.217,0,0,0,16,28.743V23.2a2.209,2.209,0,0,1,2.118-2.291h1.722A2.209,2.209,0,0,1,21.957,23.2v5.544a2.217,2.217,0,0,0,2.118,2.3h4.807A2.217,2.217,0,0,0,31,28.743v-8.6a2.4,2.4,0,0,0-.649-1.66L20.468,9.672a2.059,2.059,0,0,0-2.943-.022Z" transform="translate(1.5 0.458)" fill="#050505" />
                                        <rect width="40" height="40" fill="none" />
                                    </g>
                                </svg>
                                :
                                <svg width="40" height="40" viewBox="0 0 40 40">
                                    <g>
                                        <path d="M17.524,9.65,7.642,18.462A2.4,2.4,0,0,0,7,20.144v8.6a2.217,2.217,0,0,0,2.118,2.3h4.765A2.217,2.217,0,0,0,16,28.743V23.2a2.209,2.209,0,0,1,2.118-2.291h1.722A2.209,2.209,0,0,1,21.957,23.2v5.544a2.217,2.217,0,0,0,2.118,2.3h4.807A2.217,2.217,0,0,0,31,28.743v-8.6a2.4,2.4,0,0,0-.649-1.66L20.468,9.672a2.059,2.059,0,0,0-2.943-.022Z" transform="translate(1.5 0.458)" fill="none" stroke="#ccc" strokeMiterlimit="10" strokeWidth="2" />
                                        <rect width="40" height="40" fill="none" />
                                    </g>
                                </svg>}
                        </div>
                    </NavMenu>

                    {/* 북마크 */}
                    <NavMenu isActive={'bookmark' === selectedMenu} onClick={() => handleNavClick('bookmark')}>
                        <div className='menu_icon'>
                            {'bookmark' === selectedMenu ?
                                <svg width="40" height="40" viewBox="0 0 39 40">
                                    <g>
                                        <path d="M9,9.163V28.815a1.31,1.31,0,0,0,.637,1,1.292,1.292,0,0,0,1.181.068l7.691-4.811a1.445,1.445,0,0,1,1,0l7.673,4.811a1.292,1.292,0,0,0,1.181-.068,1.31,1.31,0,0,0,.637-1V9.163A1.249,1.249,0,0,0,27.691,8H10.309A1.249,1.249,0,0,0,9,9.163Z" fill="#050505" />
                                        <rect width="40" height="40" fill="none" stroke='none' />
                                    </g>
                                </svg>
                                :
                                <svg width="40" height="40" viewBox="0 0 39 40">
                                    <g>
                                        <path d="M9,9.163V28.815a1.31,1.31,0,0,0,.637,1,1.292,1.292,0,0,0,1.181.068l7.691-4.811a1.445,1.445,0,0,1,1,0l7.673,4.811a1.292,1.292,0,0,0,1.181-.068,1.31,1.31,0,0,0,.637-1V9.163A1.249,1.249,0,0,0,27.691,8H10.309A1.249,1.249,0,0,0,9,9.163Z" fill="none" stroke='#ccc' strokeWidth={'2.5'} />
                                        <rect width="40" height="40" fill="none" stroke='none' />
                                    </g>
                                </svg>}
                        </div>
                    </NavMenu>

                    {/* 검색 */}
                    <NavMenu isActive={false} onClick={handleSearch}>
                        <div className='menu_icon'>
                            <svg width="40" height="40" viewBox="0 0 40 40">
                                <g>
                                    <rect width="40" height="40" fill="none" />
                                    <path d="M31.466,28.906l-4.084-4.084-.068-.053a10.691,10.691,0,1,0-2.545,2.545l.053.068,4.084,4.084a1.81,1.81,0,1,0,2.56-2.56ZM10.145,18.628A8.484,8.484,0,1,1,18.628,27.1a8.484,8.484,0,0,1-8.484-8.476Z" fill='#ccc' />
                                </g>
                            </svg>
                        </div>
                    </NavMenu>

                    {/* 포스팅 */}
                    <NavMenu isActive={false} onClick={handlePosting}>
                        <div className='menu_icon'>
                            <svg width="40" height="40" viewBox="0 0 40 40">
                                <g>
                                    <path d="M18,8H11.25A3.25,3.25,0,0,0,8,11.25v13.5A3.25,3.25,0,0,0,11.25,28h13.5A3.25,3.25,0,0,0,28,24.75V18" transform="translate(1 1)" fill="none" strokeLinecap="round" strokeMiterlimit="10" strokeWidth="2.5" stroke='#ccc' />
                                    <path d="M24,21.718a.524.524,0,0,0,.524.532l1.253-.16a.569.569,0,0,0,.3-.142L37.858,10.158a.753.753,0,0,0-.142-1.029l-.6-.594a.757.757,0,0,0-1.031-.142L24.276,20.174a.567.567,0,0,0-.142.3Z" transform="translate(-8 -0.25)" fill='#ccc' />
                                </g>
                                <g>
                                    <rect width="40" height="40" fill="none" />
                                </g>
                            </svg>
                        </div>
                    </NavMenu>
                </div>
            </NavBarWrap>
            {searchToggle &&
                <SearchComponent></SearchComponent >
            }
        </>
    );
}