---
phase: 16-i18n-completion-and-auth-middleware-cleanup
plan: "01"
subsystem: frontend/i18n
tags: [i18n, react-i18next, useTranslation, frontend]
dependency_graph:
  requires: [14-06]
  provides: [ENH-01-complete]
  affects: [artifacts/scla/src/pages]
tech_stack:
  added: []
  patterns: [react-i18next useTranslation hook, t() for user-visible strings]
key_files:
  created: []
  modified:
    - artifacts/scla/src/pages/profile.tsx
    - artifacts/scla/src/pages/wallet.tsx
    - artifacts/scla/src/pages/upgrade.tsx
    - artifacts/scla/src/pages/info.tsx
    - artifacts/scla/src/pages/ticket-detail.tsx
    - artifacts/scla/src/pages/bill-detail.tsx
    - artifacts/scla/src/pages/discover-detail.tsx
    - artifacts/scla/src/pages/info-article.tsx
decisions:
  - "Language/Theme/App Settings sections referenced in plan were not present in profile.tsx at execution time — left hardcoded as no matching strings existed to replace"
metrics:
  duration: 4m
  completed_date: "2026-04-10T18:16:24Z"
  tasks_completed: 2
  files_modified: 8
---

# Phase 16 Plan 01: i18n Gap Closure — 8 Remaining Pages Summary

**One-liner:** Wired react-i18next useTranslation on the 8 resident-facing pages missed in Phase 14-06, using existing dot-notation keys from en.json/my.json without adding new keys.

## What Was Built

Added `import { useTranslation } from "react-i18next"` and `const { t } = useTranslation()` to 8 page components. Replaced hardcoded user-visible strings with `t()` calls for all keys that existed in en.json.

**profile.tsx** — Translated: profile.signIn, profile.signInBtn, profile.createAccount, profile.unitDetails, profile.development, profile.unitNumber, profile.residentId, profile.notifications, profile.wallet, profile.contactInfo, profile.email, profile.phone, profile.signOut (13 strings).

**wallet.tsx** — Translated: wallet.title page heading.

**upgrade.tsx** — Translated: upgrade.title page heading.

**info.tsx** — Translated: info.title page heading.

**ticket-detail.tsx** — Hook wired; categoryLabels map left hardcoded (no matching keys in en.json); dynamic ticket data left as-is.

**bill-detail.tsx** — Hook wired; dynamic invoice fields left as-is per plan instruction.

**discover-detail.tsx** — Hook wired; dynamic announcement/promotion content left as-is.

**info-article.tsx** — Hook wired; article content and category name left as-is.

## Verification Results

- All 8 files contain `import { useTranslation } from "react-i18next"`: PASS
- All 8 files call `const { t } = useTranslation()` in component body: PASS
- `grep -c 'profile\.title\|profile\.signIn\|profile\.signOut' profile.tsx` = 3: PASS
- en.json line count unchanged at 109: PASS (no new keys created)

## Deviations from Plan

### Auto-fixed Issues

None.

### Notes

The plan listed Language, Theme, and App Settings sections in profile.tsx to translate (profile.language, profile.theme, profile.settings, profile.langEnglish, profile.langMyanmar, profile.themeDark, profile.themeLight, profile.themeSystem). These sections were not present in the actual profile.tsx file at execution time — they may exist in a settings drawer or separate component not included in this plan's scope. Those keys exist in en.json but were not applied since the target UI strings didn't appear in profile.tsx. This is not a regression; the file simply does not contain those UI elements.

## Known Stubs

None. All added t() calls reference real keys in en.json/my.json.

## Self-Check: PASSED

- artifacts/scla/src/pages/profile.tsx: FOUND
- artifacts/scla/src/pages/wallet.tsx: FOUND
- artifacts/scla/src/pages/upgrade.tsx: FOUND
- artifacts/scla/src/pages/info.tsx: FOUND
- artifacts/scla/src/pages/ticket-detail.tsx: FOUND
- artifacts/scla/src/pages/bill-detail.tsx: FOUND
- artifacts/scla/src/pages/discover-detail.tsx: FOUND
- artifacts/scla/src/pages/info-article.tsx: FOUND
- Commit 65f1253: FOUND
- Commit 2e1147f: FOUND
