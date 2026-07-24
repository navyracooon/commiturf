# Commiturf Privacy Policy

Last updated: July 24, 2026

Commiturf turns GitHub contribution activity into a visual garden. Commiturf is an independent app and is not affiliated with GitHub.

## Data used by the app

- The GitHub username and profile image URL returned for the authorized account
- Contribution dates, counts, and intensity levels returned by GitHub’s GraphQL API. These cover public activity and private contribution counts the user has chosen to show on their GitHub profile.
- A GitHub user access token and, when token expiration is enabled, a refresh token
- A local snapshot used to render the app and home screen widgets

## Processing, storage, and sharing

Commiturf uses GitHub’s Device Flow for authorization and the official GitHub GraphQL API for contribution data. Authorization takes place on GitHub. Commiturf never receives the user's GitHub password.

The username, contribution snapshot, and widget snapshot are stored on the user's device. GitHub access and refresh tokens are stored using iOS Keychain or Android Keystore-backed secure storage. Tokens are sent only to GitHub over HTTPS when authorizing, refreshing authorization, or requesting contribution data.

Commiturf does not request access to private repositories, repository names, or repository contents. It does not operate an account server, collect analytics or advertising identifiers, or sell personal information.

GitHub processes authorization and API requests under its [Privacy Statement](https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement) and [Terms of Service](https://docs.github.com/en/site-policy/github-terms/github-terms-of-service). Apple and Google may separately process information when distributing the app under their respective policies.

## Retention and deletion

Local data remains until the user chooses **Disconnect GitHub** in the profile screen or removes the app. Disconnecting removes the saved username, contribution garden, access token, and refresh token from the device and replaces the home screen widget with an empty demo garden. Commiturf has no server-side copy to retain or delete.

Removing local tokens does not itself revoke the GitHub authorization. Users can separately revoke Commiturf from the Authorized GitHub Apps section of their GitHub settings.

## Security

Network requests use HTTPS. Commiturf does not embed a GitHub client secret or GitHub App private key in the application. Expiring user access tokens are refreshed with the device-flow refresh token, and both tokens are stored in OS-backed secure storage.

## Contact

Privacy questions can be sent through the support contact published on Commiturf's App Store and Google Play product pages.

---

# Commiturf プライバシーポリシー

最終更新日：2026年7月24日

Commiturfは、GitHubのContributionを庭として可視化する独立したアプリです。CommiturfはGitHubと提携していません。

## アプリが利用するデータ

- 認証したアカウントについてGitHubが返すユーザー名とプロフィール画像URL
- GitHub GraphQL APIが返すContributionの日付、件数、強度。公開アクティビティと、ユーザーがGitHubプロフィールで表示する設定にした非公開Contributionの件数が対象です。
- GitHubユーザーアクセストークンと、トークン期限が有効な場合はリフレッシュトークン
- アプリとホーム画面ウィジェットの描画に使う端末内スナップショット

## 処理、保存、共有

Commiturfは、認証にGitHubのDevice Flowを、Contributionデータの取得にGitHub公式GraphQL APIを使用します。認証はGitHub上で行われ、GitHubパスワードがCommiturfに渡ることはありません。

ユーザー名、Contributionスナップショット、ウィジェット用スナップショットはユーザーの端末に保存されます。GitHubのアクセストークンとリフレッシュトークンは、iOS KeychainまたはAndroid Keystoreを利用する安全なストレージに保存されます。トークンは、認証、認証の更新、Contribution取得のためにのみHTTPSでGitHubへ送信されます。

Commiturfは、非公開リポジトリ、リポジトリ名、リポジトリの内容へのアクセスを要求しません。また、アカウントサーバーを運用せず、分析情報や広告識別子を収集せず、個人情報を販売しません。

GitHubは自社の[プライバシーステートメント](https://docs.github.com/ja/site-policy/privacy-policies/github-general-privacy-statement)と[利用規約](https://docs.github.com/ja/site-policy/github-terms/github-terms-of-service)に基づいて認証およびAPIリクエストを処理します。また、AppleとGoogleは、それぞれのポリシーに基づきアプリ配布に伴う情報を処理する場合があります。

## 保存期間と削除

端末内データは、プロフィール画面で**GitHubとの接続を解除**を選ぶ、またはアプリを削除するまで保存されます。接続を解除すると、保存済みのユーザー名、Contributionの庭、アクセストークン、リフレッシュトークンが端末から削除され、ホーム画面ウィジェットは空のデモガーデンに置き換わります。Commiturfには削除対象となるサーバー上のコピーはありません。

端末内トークンの削除だけでは、GitHub側の認証は取り消されません。GitHub設定のAuthorized GitHub Appsから、Commiturfの認証を別途取り消すことができます。

## セキュリティ

通信にはHTTPSを使用します。アプリにGitHubのクライアントシークレットやGitHub Appの秘密鍵を埋め込みません。期限付きユーザーアクセストークンはDevice Flowで発行されたリフレッシュトークンを使って更新し、両方のトークンをOSの安全なストレージに保存します。

## お問い合わせ

プライバシーに関するお問い合わせは、App StoreおよびGoogle PlayのCommiturf製品ページに掲載するサポート窓口からご連絡ください。
