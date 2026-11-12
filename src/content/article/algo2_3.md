---
title: "動的計画法"
description: "動的計画法の基本的な考え方と使い方について"
date: 2026-11-11
topic: "アルゴリズム"
tags: ["動的計画法"]
toc: true
---
こんにちは，のんです．
今回は動的計画法通称DPについてです．動的計画法を使う有名な問題としてナップサック問題などがありますね．
動的計画法は値をメモしていき漸化的に問題解決を目指すものです．
ともあれ，実際に問題を解きながら学んでいきましょう．
<div class = "box">

### ナップサック問題
n個の商品があり，各商品iに対して重量$w_i$，価値$v_i$が定められています．総重量が$W$を超えないように商品を選ぶとき，商品の総価値の最大値を求めなさい．
制約：$1 \leq n \leq 100, 1 \leq w_i, v_i \leq 100, 1 \leq W \leq 10^4$

</div>
簡単な繰り返しで考えると商品を入れるか入れないかで分岐をする木構造のDFSが考えられます．しかし，この方法では最悪$O(2^n)$となり当然TLEです．このアルゴリズムの構造に注目すると，たびたび，すでに計算してある値を計算しなおしていることに気づくでしょうか．
この再計算をなくす．つまり，計算結果を再利用することで効率化できます．
メモテーブルは

```cpp
#include <iostream>
#include <vector>
#include <pair>
#include <cstring>
using namespce std;

int max_n = 100, max_W = 10000;

int dp[max_n + 1][max_W + 1];//dpテーブル
int main(){
    memset(dp, -1, sizeof(dp))//初期値を-1にしてメモを初期化
    int n;
    cin >> n;
    vector<int> w(n);
    vector<int> v(n);
    for (int i = 0; i < n; i++){
        cin >> w[i]
        cin >> v[i]
   }
    int W;
    cin >> W;
//i番目以降の商品について総重量がj以下になるように選ぶ:jは残りの重量
int dfs(int i, int j){
    if(dp[i][j] >= 0) return dp[i][j]//すでに調べてあるならば再利用
    int res;//現在の総価値
    if(i == n) res = 0;//ベースケース
    else if (j < w[i]) res = dfs(i + 1, j);//商品iの重量が残りの重量を超える場合
    else res = max(
        dfs(i + 1, j), //選ばない場合
        dfs(i + 1, j - w[i]) + v[i]//選ぶ場合
        );//商品iがまだ入る場合で価値が大きくなるほうを選択
    return dp[i][j] = res//テーブルにメモ
}
}
```
ここでdpテーブルについて，dp[i][j]は商品i以降の商品から総重量がj以下になるように選んだ時の総価値の最大値となっています．
そして，その値は，
$
dp[n][j] = 0\\
dp[i][j] = 
\begin{cases}
dp[i + 1][j] & (j < w[i])\\
max(dp[i + 1][j], dp[i + 1][j - w[i]] + v[i]) & (otherwise)
\end{cases}
$
として漸化式に表せる．
例えばdp[3][3]でw[3] = 2，v[3] = 2ならdp[4][3]とdp[4][3 - 2 = 1] + 2 ( = v[3])を比較して大きいほうを採用する
というようにテーブルの下から値を埋めるように遷移していく

| i\j | 0 | 1 | 2 | 3 | 4 | 5 |
| --- | --- | --- | --- | --- | --- | --- |
|  0  |     |     |     |     |     |
|  1  |     |     |     |     |     |
|  2  |     |     |     |     |     |
|  3  |     |     |     |     |     |
|  4  |     |     |     |     |     |

当然，漸化式を変形することで，遷移の方向を逆にすることもできる．

<div class = "box">

### 最長共通部分問題
長さnの文字列Sと長さmの文字列Tが与えられる．
これら2つの共通部分文字列の長さの最大値を求めよ．
ただし，部分文字列とは文字列Sを$S = \{s_i\}_{i\in \mathbb{N}}$と表すときの部分列$\{s_{n(i)}\}_{n(i)\in \Lambda \subseteq \mathbb{N}}$からなる文字列である．
制約：$1 \leq n,m\leq 1000 $
</div>

この問題は通称LCS（longest common subsequence）と呼ばれる問題です．
まずは，遷移について考えてみましょう．
dp[i][j]をS[1]~S[i]とT[1]~T[j]のLCSの長さとして定義しましょう．
そうすると，S[i + 1]までの文字列とT[j + 1]までの文字列の共通部分列は
- S[i + 1] = T[j + 1]ならば，S[i]，T[j]にS[i + 1]をつなげたもの
- S[i]までとT[j + 1]までの共通部分列
- S[i + 1]までとT[j]までの共通部分列

のどれかでなので，
$$
dp[i + 1][j + 1] =
\begin{cases}
dp[i][j] + 1 & (S[i + 1] = T[j + 1])\\
max(dp[i][j + 1], dp[i + 1][j]) & (otherwise)
\end{cases}
$$

という漸化式で表すことができる．
この漸化式は$O(nm)$であり解はdp[n][m]となる

```cpp
#include <iostream>
#include <string>
using namespace std;

int main(){
int n,m;
cin >> n >> m;
string s,t;
cin >> s >> t;

int dp[n][m];//dpテーブル
for(int i = 0; i < n; i++){
    for(int j = 0; j < m; j++){
        if(s[i] == t[j]){
            dp[i + 1][j + 1] = dp[i][j] + 1;
        }
        else{
            dp[i + 1][j + 1] = max(dp[i + 1][j], dp[i][j + 1]);
        }
    }
}
cout << dp[n][m] << "\n";
return 0;
}
```

基本的に漸化式に従って2重ループを作るだけでよいので簡単ですね．
次は少し問題設定が難しいものを扱ってみましょう
<div class = "box">

### ナップサック問題(個数制限なし)
n個の商品のうち，各商品iについてその重量を$w_i$，価値を$v_i$とする．これらの商品から，総重量が$W$を超えないように商品を選ぶときの総価値の最大値を求めよ．ただし，同じ種類の商品をいくつでも選択してよいとする．
制約：$1 \leq w_i, v_i \leq 100, ~ 1 \leq W \leq 10^4$

</div>

今回は重複を含めて選ぶことができます．しかし，やることは同じでとりあえず漸化式を考えることにします．
まず，dp[i + 1][j]をi番目までの商品から総重量がj以下となるように選んだ時の総価値の最大値とします．
すると漸化式は
$
dp[0][j] = 0\\
dp[i + 1][j] = \displaystyle\underset{0 \leq k}{max}(dp[i][j - k\cdot w[i]] + v[i]) (k:商品iを買う個数)
$
として表せます．
この漸化式通りに愚直にコードを書くと次のようになります．
(メタ的ですがどうせ改良するので適当に書きます)
```cpp
int dp[n][W];
for(int i = 0; i < n; i++){
    for(int j = 0; j < W; j++){
        for(int k = 0; k * w[i] <= j; k++){//j - k * w[i] >= 0が必要十分なため
            dp[i + 1][j] = max(dp[i + 1][j], dp[i][j - k * w[i]] + k * v[i])
        }
    }
}
```
しかしこれだと3重ループになり，計算量は$O(n^3)で終わっている(ほぼ確実にTLE)なので改良が必要です．
ということで効率化できる部分について考えます．
漸化式について，
$$
\begin{align*}
\displaystyle\underset{0 \leq k}{max}(dp[i][j - k\cdot w[i]] + k * v[i]) &= max(dp[i][j], \displaystyle\underset{1\leq k}{max}(dp[i][j - k * w[i]] + k * v[i]))(k' = k - 1と置いてk \geq 0で式変形していく)\\
& = max(dp[i][j], \displaystyle\underset{0 \leq k}{max}(dp[i][(j - w[i]) - k * w[i]] + k * v[i]) + v[i])（\displaystyle\underset{0 \leq k}{max}について dpの定義において，dp[i + 1][j - w[i]]としたものに等しい．）\\
& = max(dp[i][j], dp[i + 1][j - w[i]]+ v[i])
\end{align*}
$$
これで，変数を消去することができたため，2重ループにより表現可能になりました．ちなみに．計算量は$O(nW)$です．

```cpp
#include <iostream>
#include <memset>
using namespace std;

int main(){
    int n;
    cin >> n;
    int w[n],v[n];
    for(int i = 0; i < n; i++){
        cin >> w[i];
    }
    for(int i = 0; i < n; i++){
    cin >> v[i];
    }
    int W;
    cin >> W;
    for(int i = 0; i < n; i++){
        for(int j = 0; j < W; j++){
            if( j < w[i])dp[i + 1][j] = dp[i][j];
            else {
                dp[i + 1][j] = max(dp[i][j], dp[i + 1][j - w[i]] + v[i]);
            }
        }
    }
}
cout << dp[n][W] << "\n";
```