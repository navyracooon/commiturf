# Commiturf Release Checklist

Updated: July 23, 2026

コードで自動化できない提出作業と、実機でしか判定できない項目をまとめたチェックリストです。すべて完了するまでProductionへ公開しません。

## 2026年7月23日のリリース監査で完了済み

- [x] `npm run typecheck`、11件の自動テスト、Expo Doctor 20/20
- [x] Xcode 26.6 / iOS 26 SDKで、アプリとWidget Extensionを含むarm64 Release simulator build
- [x] Android 16 / API 36 targetで、Lintと全ABIを含むRelease AAB build
- [x] AndroidでiOS専用`expo-widgets`の自動リンクを除外し、AndroidウィジェットとのWorkManager重複を解消
- [x] iOS Privacy Manifest、暗号化申告、Widget bundle identifier、Android backup・権限設定をprebuild後のネイティブ成果物で確認
- [x] 公開GitHub Contribution HTMLのlive parser smoke test

## 提出を止める項目

- [ ] EAS projectを作成・紐付けし、`extra.eas.projectId` が生成されたことを確認する
- [ ] Apple Developer / App Store Connectで `app.commiturf.mobile` とApp Group `group.app.commiturf.mobile` を登録する
- [ ] Google Play Consoleで `app.commiturf.mobile` を作成し、Play App Signingを有効にする
- [ ] [`PRIVACY.md`](PRIVACY.md) を安定した公開HTTPS URLへ配置し、両ストアへ登録する
- [ ] 監視できるサポートURLまたはメールアドレスを両ストアへ登録する
- [ ] iOSはXcode 26以降・iOS 26 SDKでProduction buildを作る
- [ ] Google Playへ2026年8月31日以降に提出する場合も、Android 16 / API 36をtargetにする（現在のReact Native 0.86設定はAPI 36）

## ストア情報

- [ ] 日本語・英語のアプリ名、サブタイトル／短い説明、説明文、キーワードを登録する
- [ ] iPhoneと主要Android画面サイズのスクリーンショットを実機相当で用意する
- [ ] App Storeの新しい年齢レーティング質問へ回答する
- [ ] EUで配布する場合はApp Store ConnectのDSA trader statusを確認する
- [ ] App Review Notesに「ログイン不要、公開GitHub usernameのみ、デモモードあり、ウィジェット確認方法」を記載する
- [ ] GitHubの公式アプリではなく提携もしていないことを説明文に明記する

## プライバシー申告

- [ ] App Store ConnectのApp Privacy回答を、Production buildに含まれるSDKまで含めて確定する
- [ ] Google PlayのData safetyフォームとデータ削除質問へ回答する
- [ ] Google Playでは、入力したGitHub usernameがアプリ機能のため端末外へ送信される点をフォーム上で評価する。リアルタイム取得だけならephemeral processing、デモ利用が可能なためoptionalとして回答できるかを最終確認する
- [ ] 「端末内保存」「GitHubへ直接HTTPS送信」「分析・広告・自社サーバーなし」「接続解除で端末内データ削除」が申告とポリシーで一致することを確認する
- [ ] Androidの最終merged manifestに、`INTERNET` と `VIBRATE` 以外の不要な危険権限がないことを確認する

## Production build QA

- [ ] Apple Distribution署名を使ったiOS archiveと、Play App Signing用のProduction AABをクラウドビルドする
- [ ] 初回起動・再起動・アップデート時に現行アイコン以外が一瞬も表示されない
- [ ] iOS / Androidの実機でWeek・Month・Year、過去移動、未来日の地面表示、閏年を確認する
- [ ] GitHub接続、プロフィール変更、接続解除、無効なusername、404、機内モード、15秒タイムアウト後の復帰を確認する
- [ ] キャッシュ表示中のバックグラウンド再取得と、未キャッシュ期間の空カード表示を確認する
- [ ] Pull-to-refresh時だけRefreshControlが表示され、期間移動の再取得では表示されないことを確認する
- [ ] Reduce Motion有効時に風アニメーションが停止することを確認する
- [ ] 日本語・英語を切り替え、再起動後も選択が保持されることを確認する
- [ ] iOS Small / Medium / LargeとAndroidの小／大ウィジェットを追加・更新・リサイズ・タップする
- [ ] 接続解除直後に、アプリと全ウィジェットから以前のusernameとContributionが消えることを確認する
- [ ] VoiceOver / TalkBack、Dynamic Type、文字拡大、狭いAndroid端末で主要操作が完了できることを確認する
- [ ] GitHubのContribution HTMLは公開されているものの公式APIではないため、HTML変更時の同期停止を許容するか、OAuth + GraphQL移行をリリース前に行うかを判断する

## Google Playアカウント条件

- [ ] 2023年11月13日以降に作成した個人Developer Accountの場合、12人以上が14日間連続で参加するClosed testを開始する
- [ ] 新規個人アカウントの場合、Play Consoleアプリによる実Android端末の確認を完了する

## 段階公開

- [ ] TestFlight / Play Internal testingで最低1回、ストア配布バイナリそのものを確認する
- [ ] クラッシュ、GitHub同期失敗、ウィジェット描画失敗の連絡先と切り戻し手順を決める
- [ ] Google Playは段階的公開、App Storeは手動リリースまたは段階的リリースを選ぶ
