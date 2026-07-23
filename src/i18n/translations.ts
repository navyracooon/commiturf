export type AppLanguage = 'en' | 'ja';

export type GardenErrorCode =
  | 'githubUnavailable'
  | 'invalidUsername'
  | 'network'
  | 'profileNotFound'
  | 'storageUnavailable'
  | 'unavailableGarden'
  | 'unsupportedGitHubResponse';

export const translations = {
  en: {
    accessibility: {
      changeProfile: 'Change GitHub profile',
      close: 'Close',
      connectProfile: 'Connect GitHub profile',
      nextPeriod: 'Next period',
      openLanguage: 'Choose language',
      openPrivacy: 'Open privacy policy',
      previousPeriod: 'Previous period',
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
    },
    errors: {
      githubUnavailable: 'GitHub could not be reached. Try again in a moment.',
      invalidUsername: 'Enter a valid GitHub username.',
      network: 'Could not reach GitHub. Your saved garden is still safe.',
      profileNotFound: 'We could not find that GitHub profile.',
      storageUnavailable: 'Your garden could not be saved on this device. Try again.',
      unavailableGarden: 'That garden is not available yet. Check the username and try again.',
      unsupportedGitHubResponse: 'GitHub returned an unfamiliar garden format. Your saved garden is still safe.',
    } satisfies Record<GardenErrorCode, string>,
    garden: {
      breeze: 'gentle breeze',
      eyebrow: 'YOUR GARDEN',
      takingRoot: 'Taking root',
    },
    language: {
      body: 'Choose the language used throughout Commiturf.',
      title: 'Choose your language',
    },
    periods: {
      month: 'Month',
      week: 'Week',
      year: 'Year',
    },
    profile: {
      body: 'Enter a public GitHub username. No password, token, or account access is needed.',
      cancel: 'Cancel',
      disconnect: 'Disconnect GitHub',
      disconnectBody: 'This removes the saved profile and garden from this device and its widgets.',
      disconnectConfirm: 'Disconnect',
      disconnectTitle: 'Remove this garden?',
      inputLabel: 'GitHub username',
      note: 'Only activity visible on the public contribution graph is shown.',
      planting: 'Planting…',
      submit: 'Plant my garden',
      title: 'Grow your own garden',
    },
    privacy: {
      dataBody: 'Commiturf uses the GitHub username you enter and the public contribution dates, counts, and intensity levels returned by GitHub.',
      dataTitle: 'Data used',
      deletionBody: 'Choose “Disconnect GitHub” from the profile screen to remove the saved profile and garden from this device and refresh the widgets with an empty demo garden.',
      deletionTitle: 'Deletion',
      intro: 'Your garden stays on this device. Commiturf has no account server and does not request a password or GitHub access token.',
      thirdPartyBody: 'Public contribution data and the profile image are requested directly from GitHub over HTTPS and are subject to GitHub’s policies. Commiturf is not affiliated with GitHub.',
      thirdPartyTitle: 'GitHub',
      title: 'Privacy',
      updated: 'Updated July 23, 2026',
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
      nextPeriod: '次の期間',
      openLanguage: '言語を選択',
      openPrivacy: 'プライバシーポリシーを開く',
      previousPeriod: '前の期間',
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
    },
    errors: {
      githubUnavailable: 'GitHubに接続できませんでした。少し待ってから再度お試しください。',
      invalidUsername: '有効なGitHubユーザー名を入力してください。',
      network: 'GitHubに接続できませんでした。保存済みの庭はそのまま残っています。',
      profileNotFound: 'GitHubプロフィールが見つかりませんでした。',
      storageUnavailable: 'この端末に庭を保存できませんでした。もう一度お試しください。',
      unavailableGarden: 'Contributionグラフを取得できませんでした。ユーザー名をご確認ください。',
      unsupportedGitHubResponse: 'GitHubの表示形式が変更された可能性があります。保存済みの庭はそのまま残っています。',
    } satisfies Record<GardenErrorCode, string>,
    garden: {
      breeze: 'そよ風',
      eyebrow: 'あなたの庭',
      takingRoot: '芽吹きの途中',
    },
    language: {
      body: 'Commiturf全体で使用する言語を選択してください。',
      title: '言語を選択',
    },
    periods: {
      month: '月',
      week: '週',
      year: '年',
    },
    profile: {
      body: '公開されているGitHubユーザー名を入力してください。パスワードやトークン、アカウントへのアクセスは不要です。',
      cancel: 'キャンセル',
      disconnect: 'GitHubとの接続を解除',
      disconnectBody: 'この端末とウィジェットから、保存済みのプロフィールと庭を削除します。',
      disconnectConfirm: '接続を解除',
      disconnectTitle: 'この庭を削除しますか？',
      inputLabel: 'GitHubユーザー名',
      note: '公開Contributionグラフに表示される活動のみを反映します。',
      planting: '植えています…',
      submit: '庭を育てる',
      title: '自分の庭を育てよう',
    },
    privacy: {
      dataBody: '入力したGitHubユーザー名と、GitHubが返す公開Contributionの日付・件数・強度を使用します。',
      dataTitle: '利用するデータ',
      deletionBody: 'プロフィール画面の「GitHubとの接続を解除」を選ぶと、この端末のプロフィールと庭を削除し、ウィジェットを空のデモガーデンに更新します。',
      deletionTitle: '削除',
      intro: '庭のデータはこの端末に保存されます。Commiturfはアカウントサーバーを持たず、パスワードやGitHubアクセストークンを要求しません。',
      thirdPartyBody: '公開Contributionデータとプロフィール画像はHTTPSでGitHubへ直接リクエストされ、GitHubのポリシーが適用されます。CommiturfはGitHubと提携していません。',
      thirdPartyTitle: 'GitHub',
      title: 'プライバシー',
      updated: '2026年7月23日更新',
    },
    stats: {
      contributions: 'Contribution',
      lushestDay: '最も生い茂った日',
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
