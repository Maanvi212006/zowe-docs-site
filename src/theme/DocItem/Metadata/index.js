import React from 'react';
import OriginalMetadata from '@theme-original/DocItem/Metadata';
import Head from '@docusaurus/Head';

export default function MetadataWrapper(props) {
    console.log("🔥 METADATA WRAPPER IS ALIVE - LINE 7");

    return (
        <>
            <OriginalMetadata {...props} />
            <Head>
                <meta name="test-custom" content="this-should-appear" />
            </Head>
        </>
    );
}