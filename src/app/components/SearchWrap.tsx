import { renderToString } from 'react-dom/server';
import {
    InstantSearch,
    InstantSearchServerState,
    InstantSearchSSRProvider,
    getServerState,
    SearchBox,
    Hits,
    Pagination,
} from 'react-instantsearch';
import singletonRouter from 'next/router';
import { createInstantSearchRouterNext } from 'react-instantsearch-router-nextjs';
import { GetServerSideProps } from 'next';
import { searchClient } from '../utils/algolia';

type SearchPageProps = {
    serverState?: InstantSearchServerState;
    serverUrl: string;
};

export default function SearchPage({ serverState, serverUrl }: SearchPageProps) {
    return (
        <div className='search_wrap'>
            <InstantSearchSSRProvider {...serverState}>
                <InstantSearch
                    searchClient={searchClient}
                    indexName="user_index"
                    routing={{
                        router: createInstantSearchRouterNext({ singletonRouter, serverUrl }),
                    }}
                >
                    <SearchBox />
                    <Hits />
                    <Pagination />
                </InstantSearch>
            </InstantSearchSSRProvider>
        </div>
    );
}

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
    const protocol = req.headers['x-forwarded-proto'] || 'https';
    const host = req.headers.host || 'localhost:3000';
    const serverUrl = `${protocol}://${host}${req.url}`;

    const serverState = await getServerState(
        <SearchPage serverUrl={serverUrl} />,
        { renderToString }
    );

    return {
        props: {
            serverState,
            serverUrl,
        },
    };
}