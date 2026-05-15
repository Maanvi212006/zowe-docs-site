// @ts-check

/**
 * @typedef {object} CurrentDoc
 * @property {FrontMatter} frontMatter
 * @property {Metadata} metadata
 *
 * @typedef {object} FrontMatter
 * @property {string=} canonicalUrl
 * @property {string=} canonicalId
 *
 * @typedef {object} Metadata
 * @property {string=} unversionedId
 * @property {string=} permalink
 */

/**
 * @typedef {object} CurrentPlugin
 * @property {Array<PluginVersion>} versions
 *
 * @typedef {object} PluginVersion
 * @property {string} name
 * @property {boolean} isLast
 * @property {string} path
 * @property {Array<PluginDoc>} docs
 *
 * @typedef {object} PluginDoc
 * @property {string} id
 * @property {string} path
 */

/**
 * @param {CurrentDoc} currentDoc
 * @param {CurrentPlugin} currentPlugin
 */
function determineCanonical(currentDoc, currentPlugin) {
    const {
        frontMatter: { canonicalUrl, canonicalId },
    } = currentDoc;

    let result;

    if (canonicalUrl) {
        result = determineCanonicalFromUrl(canonicalUrl, currentPlugin);
    } else if (canonicalId) {
        result = determineCanonicalFromId(canonicalId, currentPlugin);
    } else {
        result = determineCanonicalFromDoc(currentDoc, currentPlugin);
    }

    // Trim trailing slashes
    return result?.replace(/\/+$/, "");
}

/**
 * @param {string} canonicalUrl
 * @param {CurrentPlugin} currentPlugin
 */
function determineCanonicalFromUrl(canonicalUrl, currentPlugin) {
    const match = currentPlugin.versions
        .flatMap((version) => version.docs)
        .find((doc) => doc.path === canonicalUrl);

    if (match) {
        return canonicalUrl;
    }

    throw new Error(`canonicalUrl does not exist: ${canonicalUrl}.`);
}

/**
 * @param {string} canonicalId
 * @param {CurrentPlugin} currentPlugin
 */
function determineCanonicalFromId(canonicalId, currentPlugin) {
    const match = currentPlugin.versions
        .find((x) => x.isLast)
        ?.docs.find((doc) => doc.id === canonicalId);

    if (match) {
        return match.path;
    }

    throw new Error(
        `canonicalId does not exist in latest version: ${canonicalId}.`
    );
}

/**
 * @param {CurrentDoc} currentDoc
 * @param {CurrentPlugin} currentPlugin
 */
function determineCanonicalFromDoc(currentDoc, currentPlugin) {
    const {
        metadata: { unversionedId, permalink },
    } = currentDoc;

    const match = currentPlugin.versions
        .filter((x) => x.name !== "current") // exclude `next` / unreleased
        .flatMap((x) => x.docs)
        .find((doc) => doc.id === unversionedId);

    if (match) {
        // Warn if the canonical is pointing at a versioned URL (not the true latest)
        if (match.path.match(/\/docs\/version-v[0-9]+\.[0-9]+\.x\//)) {
            console.log(
                `WARN(canonicals): document at ${permalink} points canonical at non-latest version ${match.path}`
            );
        }
        return match.path;
    }

    return permalink;
}

module.exports = determineCanonical;