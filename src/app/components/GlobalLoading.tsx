/** @jsxImportSource @emotion/react */ // 최상단에 배치
"use client";
import { MoonLoader } from "react-spinners";
import { loadingState } from "../state/PostState";
import { useRecoilValue } from "recoil";
import styled from "@emotion/styled";
import { usePathname } from "next/navigation";

const LoadingWrap = styled.div`
    position: absolute;
    width: 600px;
    left: 500px;
    top: 0;
    bottom: 0;
    z-index: 10;
  >span{
    position: absolute;
    top: 45%;
    margin : 0 auto;
  }
`

export default function GlobalLoadingWrap() {
    const loading = useRecoilValue(loadingState);
    const pathName = usePathname();
    return (
        <>
            {loading && !pathName.startsWith("/home/memo") &&
                <LoadingWrap>
                    <MoonLoader color="#0087ff" />
                </LoadingWrap >
            }
        </>
    )
}