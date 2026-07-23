# Commiturf

GitHubのcontributionを、育っていく芝として眺めるiOS / Androidアプリです。1 contribution calendarの濃淡を5段階の成長へ置き換え、週・月・年で庭の見え方そのものが変わります。

## MVPでできること

- GitHub usernameだけで公開contribution calendarを同期（token・password不要）
- Week / Month / Yearの期間切り替え
- 成長段階0〜4の芝、満開時の穂、種だけの日の表現
- 数秒おきに訪れる風の演出（Reduce Motionに追従）
- contributions / streak / lushest dayの集計
- 端末言語を初期値にした日本語・英語切り替え（選択を端末に保存）
- iOSのSmall / Medium / Largeホーム画面ウィジェット（Largeは月表示）
- Androidのリサイズ可能ホーム画面ウィジェット（大サイズは月表示）
- オフライン時は前回同期した庭を表示
- 初回起動直後から触れるデモガーデン
- アプリ内で保存プロフィールと庭を削除できる接続解除

## 技術構成

- Expo SDK 57 / React Native 0.86 / TypeScript
- `expo-widgets`（iOS WidgetKit）
- `react-native-android-widget`（Android App Widget）
- AsyncStorage（profile・garden・widget snapshotの端末保存）
- SVG + React Native Animated（芝と風。ラスター素材なし）

公開プロフィールの `https://github.com/users/{username}/contributions` から、日付・件数・GitHubのlevelを読み取ります。これはGitHubの正式な公開APIではないため、HTML変更への追従が必要です。MVP後はGitHub OAuth + GraphQL APIへ移行し、private contributionの合計も本人同意のもとで扱える構成にします。

## ローカル起動

Node.js 22.13以上が必要です。

```bash
npm install
npx expo start
```

アプリ本体の確認はExpo Goでも可能です。ホーム画面ウィジェットはネイティブ拡張を含むため、development buildを使います。

```bash
npx expo run:ios
npx expo run:android
```

## 検証

```bash
npm run typecheck
npm test
npm run doctor
```

## 最速公開の順序

1. `app.config.ts` のbundle identifier / package nameを確定する
2. EAS projectを紐付け、両OSのpreview buildを実機で確認する
3. GitHub同期、機内モード復帰、Reduce Motion、Small / Medium / Large widgetをQAする
4. `docs/PRIVACY.md` を公開URLへ置き、support URLを用意する
5. TestFlightとGoogle Play Internal testingへ同日配布する
6. 10〜20人の利用で同期成功率・D1再訪・widget追加率を確認する
7. blockerだけ直し、App Store / Play Storeへ審査提出する

```bash
npx eas-cli build --profile preview --platform all
npx eas-cli build --profile production --platform all
npx eas-cli submit --profile production --platform all
```

ウィジェットを含むため、Expo Goだけで公開判定をしないことが重要です。iOSはApp GroupとWidget Extension、AndroidはAppWidgetProviderがprebuild時に生成されます。

提出前の外部設定と実機QAは [`docs/RELEASE_CHECKLIST.md`](docs/RELEASE_CHECKLIST.md) にまとめています。

## MVP後の優先順位

1. GitHub OAuth + GraphQLへの移行
2. 自動バックグラウンド同期と同期失敗の観測
3. 季節・天候テーマ、長期streakで咲く希少植物
4. ウィジェットのサイズ・テーマ追加
5. 友人の庭、共有画像、通知はretentionを確認してから追加

MVPでは「庭を開く理由」を増やす機能より、芝の気持ちよさ・同期の信頼性・widgetの常在感を優先します。
