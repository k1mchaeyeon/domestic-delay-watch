module.exports = [
"[project]/components/BookTab.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "BookTab",
    ()=>BookTab
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$words$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/words.ts [app-ssr] (ecmascript)");
"use client";
;
;
;
function BookTab({ h }) {
    const deps = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>[
            ...new Set(h.routes.map((r)=>r.dep))
        ], [
        h
    ]);
    const [dep, setDep] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(h.routes[0].dep);
    const arrs = h.routes.filter((r)=>r.dep === dep).map((r)=>r.arr);
    const [arrPick, setArr] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(h.routes[0].arr);
    const arr = arrs.includes(arrPick) ? arrPick : arrs[0];
    const same = (x)=>x.dep === dep && x.arr === arr;
    const rate = (x)=>x.late / x.base;
    const hours = h.route_hour.filter(same).filter((x)=>x.base >= 200 && x.h >= 6).sort((a, b)=>a.h - b.h);
    const best = hours.reduce((m, x)=>!m || rate(x) < rate(m) ? x : m, null);
    const worst = hours.reduce((m, x)=>!m || rate(x) > rate(m) ? x : m, null);
    const airlines = h.route_airline.filter(same).sort((a, b)=>rate(b) - rate(a)).slice(0, 3);
    const flights = h.route_flight.filter(same).sort((a, b)=>a.rk - b.rk).slice(0, 3);
    const causes = h.route_cause.filter(same).filter((c)=>__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$words$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["CAUSE"][c.cause_group]).sort((a, b)=>b.late - a.late);
    const ctot = causes.reduce((s, c)=>s + c.late, 0);
    const all = h.cause_all.filter((c)=>__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$words$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["CAUSE"][c.cause_group]);
    const atot = all.reduce((s, c)=>s + c.late, 0);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "flex flex-col gap-4",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "grid grid-cols-[1fr_auto_1fr] items-end gap-3 rounded-[20px] border border-line bg-card p-4",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Select, {
                        label: "출발",
                        value: dep,
                        options: deps,
                        onChange: setDep
                    }, void 0, false, {
                        fileName: "[project]/components/BookTab.tsx",
                        lineNumber: 30,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "pb-3 text-2xl text-sub",
                        children: "→"
                    }, void 0, false, {
                        fileName: "[project]/components/BookTab.tsx",
                        lineNumber: 31,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Select, {
                        label: "도착",
                        value: arr,
                        options: arrs,
                        onChange: setArr
                    }, void 0, false, {
                        fileName: "[project]/components/BookTab.tsx",
                        lineNumber: 32,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/BookTab.tsx",
                lineNumber: 29,
                columnNumber: 7
            }, this),
            best && worst && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Card, {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "mb-1 text-sm font-semibold text-sub",
                        children: [
                            dep,
                            " → ",
                            arr,
                            ", 몇 시 비행기가 덜 늦어요?"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/BookTab.tsx",
                        lineNumber: 37,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "mb-2 text-3xl font-bold leading-snug",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("em", {
                                className: "not-italic text-ok",
                                children: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$words$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["hourName"])(best.h)
                            }, void 0, false, {
                                fileName: "[project]/components/BookTab.tsx",
                                lineNumber: 38,
                                columnNumber: 63
                            }, this),
                            " 비행기가 제일 덜 늦어요"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/BookTab.tsx",
                        lineNumber: 38,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-sub",
                        children: [
                            (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$words$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["hourName"])(best.h),
                            " 비행기는 ",
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("b", {
                                className: "text-ink",
                                children: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$words$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["late10"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$words$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["tenOf"])(best.late, best.base))
                            }, void 0, false, {
                                fileName: "[project]/components/BookTab.tsx",
                                lineNumber: 40,
                                columnNumber: 37
                            }, this),
                            ". ",
                            (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$words$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["hourName"])(worst.h),
                            "는 ",
                            (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$words$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["late10"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$words$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["tenOf"])(worst.late, worst.base)),
                            "."
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/BookTab.tsx",
                        lineNumber: 39,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(HourChart, {
                        hours: hours,
                        best: best,
                        worst: worst
                    }, void 0, false, {
                        fileName: "[project]/components/BookTab.tsx",
                        lineNumber: 42,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/BookTab.tsx",
                lineNumber: 36,
                columnNumber: 9
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Card, {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                        className: "mb-3 text-lg font-bold",
                        children: [
                            dep,
                            " → ",
                            arr,
                            "에서 제일 많이 늦는 항공사"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/BookTab.tsx",
                        lineNumber: 47,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "grid gap-3 sm:grid-cols-3",
                        children: airlines.map((a, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Top, {
                                rank: i + 1,
                                name: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Badge, {
                                            name: a.airline
                                        }, void 0, false, {
                                            fileName: "[project]/components/BookTab.tsx",
                                            lineNumber: 50,
                                            columnNumber: 55
                                        }, this),
                                        a.airline
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/BookTab.tsx",
                                    lineNumber: 50,
                                    columnNumber: 53
                                }, this),
                                n: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$words$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["tenOf"])(a.late, a.base)
                            }, a.airline, false, {
                                fileName: "[project]/components/BookTab.tsx",
                                lineNumber: 50,
                                columnNumber: 13
                            }, this))
                    }, void 0, false, {
                        fileName: "[project]/components/BookTab.tsx",
                        lineNumber: 48,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/BookTab.tsx",
                lineNumber: 46,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Card, {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                        className: "mb-3 text-lg font-bold",
                        children: [
                            dep,
                            " → ",
                            arr,
                            "에서 제일 자주 늦는 비행기"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/BookTab.tsx",
                        lineNumber: 56,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "grid gap-3 sm:grid-cols-3",
                        children: flights.map((f, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Top, {
                                rank: i + 1,
                                name: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
                                    children: [
                                        f.flight,
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("small", {
                                            className: "ml-1.5 text-sm font-normal text-sub",
                                            children: f.airline
                                        }, void 0, false, {
                                            fileName: "[project]/components/BookTab.tsx",
                                            lineNumber: 59,
                                            columnNumber: 64
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/BookTab.tsx",
                                    lineNumber: 59,
                                    columnNumber: 52
                                }, this),
                                n: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$words$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["tenOf"])(f.late, f.base)
                            }, f.flight, false, {
                                fileName: "[project]/components/BookTab.tsx",
                                lineNumber: 59,
                                columnNumber: 13
                            }, this))
                    }, void 0, false, {
                        fileName: "[project]/components/BookTab.tsx",
                        lineNumber: 57,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/BookTab.tsx",
                lineNumber: 55,
                columnNumber: 7
            }, this),
            ctot > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Card, {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                        className: "mb-2 text-lg font-bold",
                        children: [
                            dep,
                            " → ",
                            arr,
                            " 비행기가 늦는 이유"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/BookTab.tsx",
                        lineNumber: 66,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "mb-3 text-xl font-bold",
                        children: [
                            "이 노선에서 늦은 비행기 10대 중 ",
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("em", {
                                className: "not-italic text-bad",
                                children: [
                                    Math.round(10 * causes[0].late / ctot),
                                    "대"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/BookTab.tsx",
                                lineNumber: 68,
                                columnNumber: 33
                            }, this),
                            "는 ",
                            __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$words$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["CAUSE"][causes[0].cause_group],
                            "예요"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/BookTab.tsx",
                        lineNumber: 67,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                        className: "mb-2 mt-5 text-lg font-bold",
                        children: "전체 국내선에서 늦는 이유 순위"
                    }, void 0, false, {
                        fileName: "[project]/components/BookTab.tsx",
                        lineNumber: 70,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("ol", {
                        className: "divide-y divide-line",
                        children: all.slice(0, 5).map((c, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                className: "flex items-center justify-between py-2",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("b", {
                                                className: "mr-3 text-sub",
                                                children: i + 1
                                            }, void 0, false, {
                                                fileName: "[project]/components/BookTab.tsx",
                                                lineNumber: 74,
                                                columnNumber: 23
                                            }, this),
                                            __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$words$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["CAUSE"][c.cause_group]
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/BookTab.tsx",
                                        lineNumber: 74,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "rounded-full bg-soft px-2.5 py-0.5 text-sm",
                                        children: [
                                            "100대 중 ",
                                            Math.max(1, Math.round(100 * c.late / atot)),
                                            "대"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/BookTab.tsx",
                                        lineNumber: 75,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, c.cause_group, true, {
                                fileName: "[project]/components/BookTab.tsx",
                                lineNumber: 73,
                                columnNumber: 15
                            }, this))
                    }, void 0, false, {
                        fileName: "[project]/components/BookTab.tsx",
                        lineNumber: 71,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/BookTab.tsx",
                lineNumber: 65,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/BookTab.tsx",
        lineNumber: 28,
        columnNumber: 5
    }, this);
}
function Select({ label, value, options, onChange }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
        className: "flex flex-col gap-1 text-xs font-semibold text-sub",
        children: [
            label,
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                value: value,
                onChange: (e)=>onChange(e.target.value),
                className: "cursor-pointer appearance-none rounded-2xl border border-line bg-soft px-3.5 py-3 text-xl font-bold text-ink",
                children: options.map((o)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                        children: o
                    }, o, false, {
                        fileName: "[project]/components/BookTab.tsx",
                        lineNumber: 90,
                        columnNumber: 29
                    }, this))
            }, void 0, false, {
                fileName: "[project]/components/BookTab.tsx",
                lineNumber: 89,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/BookTab.tsx",
        lineNumber: 87,
        columnNumber: 5
    }, this);
}
function Card({ children }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
        className: "min-w-0 rounded-[20px] border border-line bg-card px-5 py-5",
        children: children
    }, void 0, false, {
        fileName: "[project]/components/BookTab.tsx",
        lineNumber: 97,
        columnNumber: 10
    }, this);
}
function Badge({ name }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
        className: "mr-2 inline-grid size-7 place-items-center rounded-full bg-ink align-middle font-mono text-[11px] font-bold text-bg",
        children: __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$words$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["AIR_CODE"][name] ?? name.slice(0, 2)
    }, void 0, false, {
        fileName: "[project]/components/BookTab.tsx",
        lineNumber: 101,
        columnNumber: 10
    }, this);
}
function Top({ rank, name, n }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "flex flex-col gap-1.5 rounded-2xl bg-soft px-4 py-3.5",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: "text-xs font-semibold text-sub",
                children: [
                    rank,
                    "위"
                ]
            }, void 0, true, {
                fileName: "[project]/components/BookTab.tsx",
                lineNumber: 107,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: "text-xl font-bold",
                children: name
            }, void 0, false, {
                fileName: "[project]/components/BookTab.tsx",
                lineNumber: 108,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: "text-2xl font-bold text-bad",
                children: [
                    "10번 중 ",
                    n,
                    "번",
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("small", {
                        className: "ml-1 text-sm font-normal text-sub",
                        children: "늦어요"
                    }, void 0, false, {
                        fileName: "[project]/components/BookTab.tsx",
                        lineNumber: 109,
                        columnNumber: 63
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/BookTab.tsx",
                lineNumber: 109,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: "flex gap-[3px]",
                "aria-label": `10번 중 ${n}번`,
                children: Array.from({
                    length: 10
                }, (_, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("i", {
                        className: `size-2 rounded-full ${i < n ? "bg-bad" : "bg-dot"}`
                    }, i, false, {
                        fileName: "[project]/components/BookTab.tsx",
                        lineNumber: 111,
                        columnNumber: 47
                    }, this))
            }, void 0, false, {
                fileName: "[project]/components/BookTab.tsx",
                lineNumber: 110,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/BookTab.tsx",
        lineNumber: 106,
        columnNumber: 5
    }, this);
}
function HourChart({ hours, best, worst }) {
    const W = 640, H = 200, pb = 26, pt = 24, bw = (W - 8) / hours.length;
    const max = Math.max(...hours.map((x)=>x.late / x.base)) * 1.15;
    const y = (v)=>pt + (H - pt - pb) * (1 - v / max);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "mt-4 rounded-2xl bg-map px-3.5 pb-2.5 pt-4",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
            viewBox: `0 0 ${W} ${H}`,
            className: "block h-auto w-full",
            role: "img",
            "aria-label": "출발 시간대별로 늦게 뜬 비율",
            children: hours.map((x, i)=>{
                const v = x.late / x.base, bx = 4 + i * bw + bw * 0.18, w = bw * 0.64;
                const hi = x === best || x === worst;
                const c = x === best ? "var(--ok)" : x === worst ? "var(--bad)" : "var(--map-sub)";
                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("g", {
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("rect", {
                            x: bx,
                            y: y(v),
                            width: w,
                            height: H - pb - y(v),
                            rx: 3,
                            fill: c,
                            opacity: hi ? 1 : 0.55,
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("title", {
                                children: `${x.h}시 · 10번 중 ${(0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$words$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["tenOf"])(x.late, x.base)}번 늦음 · ${x.flights.toLocaleString()}편`
                            }, void 0, false, {
                                fileName: "[project]/components/BookTab.tsx",
                                lineNumber: 131,
                                columnNumber: 17
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/components/BookTab.tsx",
                            lineNumber: 130,
                            columnNumber: 15
                        }, this),
                        hi && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("text", {
                            x: bx + w / 2,
                            y: y(v) - 7,
                            textAnchor: "middle",
                            fontSize: 13,
                            fontWeight: 700,
                            fill: c,
                            children: [
                                Math.round(100 * v),
                                "%"
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/BookTab.tsx",
                            lineNumber: 133,
                            columnNumber: 22
                        }, this),
                        (x.h % 3 === 0 || hi) && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("text", {
                            x: bx + w / 2,
                            y: H - 7,
                            textAnchor: "middle",
                            fontSize: 12,
                            fill: "var(--map-sub)",
                            children: [
                                x.h,
                                "시"
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/BookTab.tsx",
                            lineNumber: 134,
                            columnNumber: 41
                        }, this)
                    ]
                }, x.h, true, {
                    fileName: "[project]/components/BookTab.tsx",
                    lineNumber: 129,
                    columnNumber: 13
                }, this);
            })
        }, void 0, false, {
            fileName: "[project]/components/BookTab.tsx",
            lineNumber: 123,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/components/BookTab.tsx",
        lineNumber: 122,
        columnNumber: 5
    }, this);
}
}),
"[project]/components/Tabs.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Tabs",
    ()=>Tabs
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$BookTab$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/BookTab.tsx [app-ssr] (ecmascript)");
"use client";
;
;
;
const TABS = [
    {
        id: "book",
        label: "예약할 때",
        sub: "몇 시가 좋을까"
    },
    {
        id: "leave",
        label: "출발 전",
        sub: "오늘 늦을까"
    },
    {
        id: "airport",
        label: "공항에서",
        sub: "왜, 얼마나"
    },
    {
        id: "arrive",
        label: "도착",
        sub: "언제 나올까"
    }
];
function Tabs({ h }) {
    const [tab, setTab] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("book");
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("nav", {
                role: "tablist",
                "aria-label": "여행 단계",
                className: "sticky top-0 z-10 grid grid-cols-4 gap-1 rounded-2xl border border-line bg-card p-1",
                children: TABS.map((t)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        role: "tab",
                        "aria-selected": tab === t.id,
                        onClick: ()=>setTab(t.id),
                        className: `rounded-xl px-1.5 py-2.5 text-sm font-semibold transition-colors ${tab === t.id ? "bg-blue text-white" : "text-sub hover:bg-soft"}`,
                        children: [
                            t.label,
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "block text-[11px] font-medium opacity-80",
                                children: t.sub
                            }, void 0, false, {
                                fileName: "[project]/components/Tabs.tsx",
                                lineNumber: 24,
                                columnNumber: 13
                            }, this)
                        ]
                    }, t.id, true, {
                        fileName: "[project]/components/Tabs.tsx",
                        lineNumber: 21,
                        columnNumber: 11
                    }, this))
            }, void 0, false, {
                fileName: "[project]/components/Tabs.tsx",
                lineNumber: 19,
                columnNumber: 7
            }, this),
            tab === "book" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$BookTab$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["BookTab"], {
                h: h
            }, void 0, false, {
                fileName: "[project]/components/Tabs.tsx",
                lineNumber: 28,
                columnNumber: 26
            }, this),
            tab !== "book" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                className: "rounded-[20px] border border-dashed border-line px-5 py-8 text-sub",
                children: "이 탭은 HTML 1차안(site/index.html)에서 옮기는 중이에요. 편 검색·지도·다른 날 비교를 같은 구조로 컴포넌트로 나눌 예정이에요."
            }, void 0, false, {
                fileName: "[project]/components/Tabs.tsx",
                lineNumber: 30,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/Tabs.tsx",
        lineNumber: 18,
        columnNumber: 5
    }, this);
}
}),
"[project]/lib/words.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// 승객에게 보여 줄 말. 전문 용어 대신 "10번 중 몇 번"
__turbopack_context__.s([
    "AIR_CODE",
    ()=>AIR_CODE,
    "CAUSE",
    ()=>CAUSE,
    "hourName",
    ()=>hourName,
    "late10",
    ()=>late10,
    "tenOf",
    ()=>tenOf
]);
const tenOf = (late, base)=>base ? Math.round(10 * late / base) : 0;
const late10 = (n)=>n <= 0 ? "거의 안 늦어요" : `10번 중 ${n}번 늦어요`;
const hourName = (h)=>h < 12 ? `오전 ${h}시` : h === 12 ? "낮 12시" : `오후 ${h - 12}시`;
const CAUSE = {
    "항공기 연결": "앞 비행기가 늦게 와서",
    항공교통흐름: "하늘길이 붐벼서",
    "공항·출입국 절차": "공항 수속이 밀려서",
    기상: "날씨 때문에",
    "항공기 정비": "비행기 점검 때문에",
    "여객·화물처리": "승객·짐 처리가 늦어서",
    "운항·승무원": "승무원 사정으로",
    지상조업: "지상 작업이 늦어서",
    기타: "그 밖의 이유로"
};
const AIR_CODE = {
    대한항공: "KE",
    아시아나항공: "OZ",
    제주항공: "7C",
    진에어: "LJ",
    트리니티항공: "TW",
    에어부산: "BX",
    에어서울: "RS",
    이스타항공: "ZE",
    에어로케이항공: "RF",
    파라타항공: "WE",
    하이에어: "4H",
    섬에어: "XU"
};
}),
"[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

module.exports = __turbopack_context__.r("[project]/node_modules/next/dist/server/route-modules/app-page/module.compiled.js [app-ssr] (ecmascript)").vendored['react-ssr'].ReactJsxDevRuntime;
}),
];

//# sourceMappingURL=_1v2ry-u._.js.map