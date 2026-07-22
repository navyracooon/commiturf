export type AppLanguage = 'en' | 'ja';

export type GardenErrorCode =
  | 'githubUnavailable'
  | 'invalidUsername'
  | 'network'
  | 'profileNotFound'
  | 'unavailableGarden';

export const translations = {
  en: {
    accessibility: {
      changeProfile: 'Change GitHub profile',
      close: 'Close',
      connectProfile: 'Connect GitHub profile',
      switchLanguage: 'Switch to Japanese',
    },
    app: {
      connect: 'Connect GitHub',
      connectedTitle: 'Your garden is\ngrowing.',
      demoSubtitle: 'A living record of the work you put in.',
      demoTitle: 'Grow with every\ncontribution.',
      footer: 'Small steps become wild places.',
      savedGarden: 'showing the last saved garden',
      syncing: 'tending the garden…',
      upToDate: 'garden is up to date',
      widgetBadge: 'iOS + ANDROID',
      widgetEyebrow: 'HOME SCREEN GARDEN',
      widgetTitle: 'Keep your momentum in sight.',
    },
    errors: {
      githubUnavailable: 'GitHub could not be reached. Try again in a moment.',
      invalidUsername: 'Enter a valid GitHub username.',
      network: 'Could not reach GitHub. Your saved garden is still safe.',
      profileNotFound: 'We could not find that GitHub profile.',
      unavailableGarden: 'That garden is not available yet. Check the username and try again.',
    } satisfies Record<GardenErrorCode, string>,
    garden: {
      breeze: 'gentle breeze',
      eyebrow: 'YOUR GARDEN',
      takingRoot: 'Taking root',
    },
    periods: {
      month: 'Month',
      week: 'Week',
      year: 'Year',
    },
    profile: {
      body: 'Enter a public GitHub username. No password, token, or account access is needed.',
      note: 'Only activity visible on the public contribution graph is shown.',
      planting: 'Planting…',
      submit: 'Plant my garden',
      title: 'Grow your own garden',
    },
    stats: {
      contributions: 'Contributions',
      lushestDay: 'Lushest day',
      streak: 'Day streak',
    },
    widget: {
      streak: (days: number) => `${days} day streak`,
      thisWeek: 'this week',
    },
  },
  ja: {
    accessibility: {
      changeProfile: 'GitHubプロフィールを変更',
      close: '閉じる',
      connectProfile: 'GitHubプロフィールを接続',
      switchLanguage: '英語に切り替える',
    },
    app: {
      connect: 'GitHubを接続',
      connectedTitle: 'あなたの庭は\n育っています。',
      demoSubtitle: '積み重ねた活動が、生きた記録になる。',
      demoTitle: 'Contributionのたび、\n庭が育つ。',
      footer: '小さな一歩が、やがて豊かな庭になる。',
      savedGarden: '保存済みの庭を表示しています',
      syncing: '庭を手入れしています…',
      upToDate: '庭は最新です',
      widgetBadge: 'iOS + ANDROID',
      widgetEyebrow: 'ホーム画面の庭',
      widgetTitle: '積み重ねを、いつでも目に。',
    },
    errors: {
      githubUnavailable: 'GitHubに接続できませんでした。少し待ってから再度お試しください。',
      invalidUsername: '有効なGitHubユーザー名を入力してください。',
      network: 'GitHubに接続できませんでした。保存済みの庭はそのまま残っています。',
      profileNotFound: 'GitHubプロフィールが見つかりませんでした。',
      unavailableGarden: 'Contributionグラフを取得できませんでした。ユーザー名をご確認ください。',
    } satisfies Record<GardenErrorCode, string>,
    garden: {
      breeze: 'そよ風',
      eyebrow: 'あなたの庭',
      takingRoot: '芽吹きの途中',
    },
    periods: {
      month: '月',
      week: '週',
      year: '年',
    },
    profile: {
      body: '公開されているGitHubユーザー名を入力してください。パスワードやトークン、アカウントへのアクセスは不要です。',
      note: '公開Contributionグラフに表示される活動のみを反映します。',
      planting: '植えています…',
      submit: '庭を育てる',
      title: '自分の庭を育てよう',
    },
    stats: {
      contributions: 'Contribution',
      lushestDay: '最も茂った日',
      streak: '連続日数',
    },
    widget: {
      streak: (days: number) => `${days}日連続`,
      thisWeek: '今週',
    },
  },
} as const;

export function detectLanguage(locale: string | undefined): AppLanguage {
  return locale?.toLowerCase().startsWith('ja') ? 'ja' : 'en';
}

export function localeFor(language: AppLanguage): string {
  return language === 'ja' ? 'ja-JP' : 'en-US';
}
