export type AppLanguage = 'en' | 'ja';

export type GardenErrorCode =
  | 'authConfiguration'
  | 'authDenied'
  | 'authExpired'
  | 'githubUnavailable'
  | 'network'
  | 'rateLimited'
  | 'storageUnavailable'
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
      authConfiguration: 'GitHub sign-in is not configured in this build.',
      authDenied: 'GitHub authorization was cancelled.',
      authExpired: 'Your GitHub authorization expired. Disconnect and connect again.',
      githubUnavailable: 'GitHub could not be reached. Try again in a moment.',
      network: 'Could not reach GitHub. Your saved garden is still safe.',
      rateLimited: 'GitHub’s API limit was reached. Your saved garden is still safe; try again later.',
      storageUnavailable: 'Your garden could not be saved on this device. Try again.',
      unsupportedGitHubResponse: 'GitHub’s API returned an unfamiliar response. Your saved garden is still safe.',
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
      body: 'Authorize Commiturf with GitHub to load your contribution calendar through the official API. Commiturf never sees your password.',
      cancel: 'Cancel',
      codeBody: 'Enter this one-time code on GitHub. Keep Commiturf open while authorization completes.',
      codeLabel: 'One-time code',
      connect: 'Continue with GitHub',
      connecting: 'Preparing GitHub…',
      disconnect: 'Disconnect GitHub',
      disconnectBody: 'This removes the saved profile, garden, and GitHub tokens from this device and its widgets.',
      disconnectConfirm: 'Disconnect',
      disconnectTitle: 'Remove this garden?',
      note: 'No access to private repositories, repository names, or contents.',
      openGitHub: 'Open GitHub',
      title: 'Grow your own garden',
      waiting: 'Waiting for GitHub authorization…',
    },
    privacy: {
      dataBody: 'Commiturf uses your GitHub username, profile image URL, and the contribution dates, counts, and intensity levels returned by GitHub’s GraphQL API. This includes public activity and private contribution counts you chose to show on your GitHub profile. Private repositories, repository names, and contents are not requested.',
      dataTitle: 'Data used',
      deletionBody: 'Choose “Disconnect GitHub” from the profile screen to remove the saved profile, garden, access token, and refresh token from this device and refresh the widgets with an empty demo garden. You can separately revoke Commiturf from your GitHub settings.',
      deletionTitle: 'Deletion',
      intro: 'Your garden and GitHub authorization tokens stay on this device. Tokens are stored using iOS Keychain or Android Keystore-backed secure storage. Commiturf has no account server and never receives your GitHub password.',
      thirdPartyBody: 'Authentication and contribution data are requested directly from GitHub over HTTPS using GitHub’s Device Flow and GraphQL API. GitHub’s policies apply. Commiturf is independent and is not affiliated with GitHub.',
      thirdPartyTitle: 'GitHub',
      title: 'Privacy',
      updated: 'Updated July 24, 2026',
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
      authConfiguration: 'このビルドではGitHubログインが設定されていません。',
      authDenied: 'GitHubの認証がキャンセルされました。',
      authExpired: 'GitHubの認証期限が切れました。接続を解除して、もう一度接続してください。',
      githubUnavailable: 'GitHubに接続できませんでした。少し待ってから再度お試しください。',
      network: 'GitHubに接続できませんでした。保存済みの庭はそのまま残っています。',
      rateLimited: 'GitHub APIの利用上限に達しました。保存済みの庭はそのままです。時間をおいて再度お試しください。',
      storageUnavailable: 'この端末に庭を保存できませんでした。もう一度お試しください。',
      unsupportedGitHubResponse: 'GitHub APIから予期しない応答がありました。保存済みの庭はそのまま残っています。',
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
      body: 'GitHubの公式APIからContributionカレンダーを取得するため、CommiturfをGitHubで認証します。パスワードがCommiturfに渡ることはありません。',
      cancel: 'キャンセル',
      codeBody: 'GitHubで次のワンタイムコードを入力してください。認証が完了するまでCommiturfを開いたままにしてください。',
      codeLabel: 'ワンタイムコード',
      connect: 'GitHubで続ける',
      connecting: 'GitHubを準備しています…',
      disconnect: 'GitHubとの接続を解除',
      disconnectBody: 'この端末とウィジェットから、保存済みのプロフィール、庭、GitHubトークンを削除します。',
      disconnectConfirm: '接続を解除',
      disconnectTitle: 'この庭を削除しますか？',
      note: '非公開リポジトリ、リポジトリ名、内容へのアクセスは要求しません。',
      openGitHub: 'GitHubを開く',
      title: '自分の庭を育てよう',
      waiting: 'GitHubの認証を待っています…',
    },
    privacy: {
      dataBody: 'GitHub GraphQL APIが返すGitHubユーザー名、プロフィール画像URL、Contributionの日付・件数・強度を使用します。公開アクティビティと、GitHubプロフィールで表示する設定にした非公開Contributionの件数が対象です。非公開リポジトリ、リポジトリ名、内容へのアクセスは要求しません。',
      dataTitle: '利用するデータ',
      deletionBody: 'プロフィール画面の「GitHubとの接続を解除」を選ぶと、この端末のプロフィール、庭、アクセストークン、リフレッシュトークンを削除し、ウィジェットを空のデモガーデンに更新します。GitHub設定からCommiturfの認証を別途取り消すこともできます。',
      deletionTitle: '削除',
      intro: '庭とGitHub認証トークンはこの端末に保存されます。トークンはiOS KeychainまたはAndroid Keystoreを利用する安全なストレージに保存されます。Commiturfはアカウントサーバーを持たず、GitHubパスワードを受け取りません。',
      thirdPartyBody: '認証とContributionデータは、GitHubのDevice FlowとGraphQL APIを使いHTTPSでGitHubへ直接リクエストされます。GitHubのポリシーが適用されます。CommiturfはGitHubと提携していません。',
      thirdPartyTitle: 'GitHub',
      title: 'プライバシー',
      updated: '2026年7月24日更新',
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
