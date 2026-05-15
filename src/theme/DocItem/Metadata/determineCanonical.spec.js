const determineCanonical = require("./determineCanonical");

describe("determineCanonical", () => {
    let currentDoc;
    let currentPlugin;

    // ─── canonicalUrl in frontmatter ───────────────────────────────────────────
    describe("when canonicalUrl is specified in frontmatter", () => {
        beforeEach(() => {
            currentDoc = aCurrentDoc({
                frontMatter: { canonicalUrl: "/docs/getting-started/overview" },
            });
        });

        describe("and the URL exists in the latest version", () => {
            beforeEach(() => {
                currentPlugin = aCurrentPlugin({
                    versions: [
                        aPluginVersion({
                            name: "v3.0.x",
                            isLast: true,
                            docs: [
                                aPluginDoc({ path: "/docs/getting-started/overview" }),
                            ],
                        }),
                    ],
                });
            });

            it("returns the canonical URL", () => {
                expect(determineCanonical(currentDoc, currentPlugin)).toEqual(
                    "/docs/getting-started/overview"
                );
            });
        });

        describe("and the URL exists in an older version", () => {
            beforeEach(() => {
                currentPlugin = aCurrentPlugin({
                    versions: [
                        aPluginVersion({
                            name: "v2.17.x",
                            isLast: false,
                            docs: [
                                aPluginDoc({ path: "/docs/getting-started/overview" }),
                            ],
                        }),
                    ],
                });
            });

            it("returns the canonical URL", () => {
                expect(determineCanonical(currentDoc, currentPlugin)).toEqual(
                    "/docs/getting-started/overview"
                );
            });
        });

        describe("and the URL does not exist anywhere", () => {
            beforeEach(() => {
                currentPlugin = aCurrentPlugin({
                    versions: [
                        aPluginVersion({
                            name: "v3.0.x",
                            isLast: true,
                            docs: [
                                aPluginDoc({ path: "/docs/some-other-page" }),
                            ],
                        }),
                    ],
                });
            });

            it("throws an error", () => {
                expect(() => determineCanonical(currentDoc, currentPlugin)).toThrow(
                    "canonicalUrl does not exist: /docs/getting-started/overview."
                );
            });
        });
    });

    // ─── canonicalId in frontmatter ────────────────────────────────────────────
    describe("when canonicalId is specified in frontmatter", () => {
        beforeEach(() => {
            currentDoc = aCurrentDoc({
                frontMatter: { canonicalId: "getting-started/overview" },
            });
        });

        describe("and the latest version has a doc with that ID", () => {
            beforeEach(() => {
                currentPlugin = aCurrentPlugin({
                    versions: [
                        aPluginVersion({
                            name: "v3.0.x",
                            isLast: true,
                            docs: [
                                aPluginDoc({
                                    id: "getting-started/overview",
                                    path: "/docs/getting-started/overview",
                                }),
                            ],
                        }),
                    ],
                });
            });

            it("returns that doc's path", () => {
                expect(determineCanonical(currentDoc, currentPlugin)).toEqual(
                    "/docs/getting-started/overview"
                );
            });
        });

        describe("and the latest version does NOT have a doc with that ID", () => {
            beforeEach(() => {
                currentPlugin = aCurrentPlugin({
                    versions: [
                        aPluginVersion({
                            name: "v3.0.x",
                            isLast: true,
                            docs: [
                                aPluginDoc({ id: "some-other-page" }),
                            ],
                        }),
                    ],
                });
            });

            it("throws an error", () => {
                expect(() => determineCanonical(currentDoc, currentPlugin)).toThrow(
                    "canonicalId does not exist in latest version: getting-started/overview."
                );
            });
        });
    });

    // ─── no frontmatter (auto-detect) ──────────────────────────────────────────
    describe("when no canonical frontmatter is specified", () => {
        beforeEach(() => {
            currentDoc = aCurrentDoc({
                frontMatter: {},
                metadata: {
                    unversionedId: "getting-started/overview",
                    permalink: "/docs/version-v2.17.x/getting-started/overview",
                },
            });
        });

        describe("and a newer version has the same doc", () => {
            beforeEach(() => {
                currentPlugin = aCurrentPlugin({
                    versions: [
                        aPluginVersion({
                            name: "v3.0.x",
                            isLast: true,
                            docs: [
                                aPluginDoc({
                                    id: "getting-started/overview",
                                    path: "/docs/getting-started/overview",
                                }),
                            ],
                        }),
                        aPluginVersion({
                            name: "v2.17.x",
                            isLast: false,
                            docs: [
                                aPluginDoc({
                                    id: "getting-started/overview",
                                    path: "/docs/version-v2.17.x/getting-started/overview",
                                }),
                            ],
                        }),
                    ],
                });
            });

            it("returns the newer version's path", () => {
                expect(determineCanonical(currentDoc, currentPlugin)).toEqual(
                    "/docs/getting-started/overview"
                );
            });
        });

        describe("and the path has a trailing slash", () => {
            beforeEach(() => {
                currentPlugin = aCurrentPlugin({
                    versions: [
                        aPluginVersion({
                            name: "v3.0.x",
                            isLast: true,
                            docs: [
                                aPluginDoc({
                                    id: "getting-started/overview",
                                    path: "/docs/getting-started/overview/",
                                }),
                            ],
                        }),
                    ],
                });
            });

            it("removes the trailing slash", () => {
                expect(determineCanonical(currentDoc, currentPlugin)).toEqual(
                    "/docs/getting-started/overview"
                );
            });
        });

        describe("and the next/unreleased version also has the same doc", () => {
            beforeEach(() => {
                currentPlugin = aCurrentPlugin({
                    versions: [
                        aPluginVersion({
                            name: "current", // this is the "next" unreleased version
                            isLast: false,
                            docs: [
                                aPluginDoc({
                                    id: "getting-started/overview",
                                    path: "/docs/next/getting-started/overview",
                                }),
                            ],
                        }),
                        aPluginVersion({
                            name: "v3.0.x",
                            isLast: true,
                            docs: [
                                aPluginDoc({
                                    id: "getting-started/overview",
                                    path: "/docs/getting-started/overview",
                                }),
                            ],
                        }),
                    ],
                });
            });

            it("ignores next and returns the real latest version's path", () => {
                expect(determineCanonical(currentDoc, currentPlugin)).toEqual(
                    "/docs/getting-started/overview"
                );
            });
        });

        describe("and no other version has the same doc", () => {
            beforeEach(() => {
                currentPlugin = aCurrentPlugin({
                    versions: [
                        aPluginVersion({
                            name: "v3.0.x",
                            isLast: true,
                            docs: [
                                aPluginDoc({ id: "some-other-page" }),
                            ],
                        }),
                    ],
                });
            });

            it("returns the current page's own permalink (self-reference)", () => {
                expect(determineCanonical(currentDoc, currentPlugin)).toEqual(
                    "/docs/version-v2.17.x/getting-started/overview"
                );
            });
        });
    });
});

// ─── Fake data factories ────────────────────────────────────────────────────

function aCurrentDoc(specs = {}) {
    return {
        frontMatter: {},
        metadata: {
            unversionedId: "getting-started/overview",
            permalink: "/docs/version-v2.17.x/getting-started/overview",
        },
        ...specs,
    };
}

function aCurrentPlugin(specs = {}) {
    return {
        versions: [],
        ...specs,
    };
}

function aPluginVersion(specs = {}) {
    return {
        name: "v3.0.x",
        isLast: true,
        path: "/docs",
        docs: [],
        ...specs,
    };
}

function aPluginDoc(specs = {}) {
    return {
        id: "getting-started/overview",
        path: "/docs/getting-started/overview",
        ...specs,
    };
}