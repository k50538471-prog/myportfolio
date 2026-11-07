---
title: "全探索について"
description: "全探索の基本アルゴリズムについて"
date: 2026-11-07
topic: "アルゴリズム"
tags: ["DFS","BFS"]
toc: true
---
アルゴリズムの基本となるものであり，すべてのデータをしらみつぶしに調べ解を探すもの  
ここでは，深さ優先探索(DFS)と幅優先探索(BFS)を扱う  
## その前に必要なデータ構造 
### 再帰関数  
関数内で関数を呼び出す関数  
例えば階乗計算をする関数```int fact(int n)```を作りたい場合，当然ループで書くこともできるが，再帰を用いて次のように書くこともできる．  
```
int fact(int n){
    if(n == 0)return 1;
    return n * fact(n-1);
}
```
再帰を書くときは，再帰が停止するためのベースケースと再帰ケースが必要
フィボナッチ数列を計算する場合はフィボナッチ数列の定義は$a_0 = 0, a_1 = 1, a_n = a_{n-1} + a_{n-2}$であるから   
```
int fib(int n){
    if(n == 0 || n == 1)return n;
    return fib(n - 1) + fib(n - 2);
}
```
しかし，この関数ではn = 40のような小さなnに対してもデータ構造が指数的に広がっていくため，計算量が爆発する．例えば  
fib(10) = fib(9) + fib(8)  
fib(9) = fib(8) + fib(7)
fib(8) = fib(7) + fib(6)
と同じ値を何度も計算する必要があるためである  
そこで，配列などに値を保存しておくことで高速化が可能になる.  
この考え方をメモ探索や動的計画法で使う．  
```
memo[n + 1]
    int fib(int n){
        if(n == 0 || n == 1)return n;
        if(memo[n] != 0)return memo[n];//計算済みならスキップ
        return memo[n] = fib(n - 1) + fib(n - 2);//計算してないなら計算
    }
```
### Stack  
スタックはpushとpopの2つの操作が可能なデータ構造．pushはスタックの一番上にデータを挿入する操作で，popはスタックの一番上からデータを取り出す操作．この構造をLIFO(last in first out)と呼ぶ．  
```
#include<iostream>
#include<stack>
using namespace std;

int main(){
    stack<int> s;
    s.push(1);//s={1}
    s.push(3);//s={1,3}
    s.push(2);//s={1,3,2}
    cout << s.top <<"\n";//2
    s.pop();{1,3,2}->{1,3}
}
```
### queue  
キューはスタックと同様pushとpopの2つの操作ができるデータ構造であるが，キューはpopで一番前から取り出す．そのため，このようなデータ構造をFIFO(first in first out)と呼ぶ．  
```
#include<queue>
#include<iostream>
using namespace std;

int main(){
    queue<int> q;
    q.push(3);//{3}
    q.push(1);//{3,1}
    q.push(2);//{3,1,2}
    cout <<q.front() <<"\n";//3
    q.pop();//{1,2}
    q.pop();//{2}
    cout << q.front() <<"\n";//2
}
```
## 本編
### 深さ優先探索  
通称DFS(depth first search)とは，ある状態からはじめ，遷移できなくなるまで状態を進めていき，遷移できなくなったらひとつ前の状態に戻り別の遷移に進を繰り返すもの．基本的に再帰関数で実装することが多い．  
```
              1
            /   \
           2     5
          / \   / \
         3   4 6   7
```

<div class = "box">

### 例題1 : 部分和問題  
整数　$a_1 , ... , a_n$が与えられ，その中からいくつか選び，その和をちょうどkにすることが出来るかを判定してください．  
制約：$ 1 \leq n \leq 20,-10^8 \leq a_i \leq 10^8,-10^8 \leq k \leq 10^8 $

</div>

方針：a_1から順に加えるかどうかを決めていき，n個すべてについて決め終わったら，その和がkに等しいかどうか判定する．状態は$2^{n+1}$程度なので計算量は$O(2^n)$になる
```cpp
int main(){
    int n,k;
    cin >> n;
    int a[n];
    for(int i = 0; i < n; i++){
        cin >> a[i]//aの添え字とインデックスが1ずれていることに注意
    }
    cin >> k;

    //iまででsumを作って，残りi以降を調べる．
    bool dfs(int i, int sum){
    //n個決め終わったら，sumとkが等しいかを返す
    if(i == n) return sum == k;

    //a[i]を使わない場合
    if(dfs(i + 1, sum)) return true;
    //a[i]を使う場合
    if(dfs(i + 1, sum + a[i]))return true;

    return false;
    }

    void solve(){
        if(dfs(0,0))cout <<"Yes\n";
        else cout << "No\n";
    }
}
``` 

<div class = "box">

### 例題2 : Lake Counting(from POJ No.2386)  
大きさN×Mの庭があります．そこに雨が降り，水たまりが出来ました．水たまりは8近傍で隣接している場合につながっているとみなします．全部でいくつの水たまりがあるでしょうか(ただし，８近傍とは次のWに対する*の部分を指す．)  
```text
***
*W*
***
```  
制約：$ N,M \leq 100$  

</div>

方針： 適当なWから始め，そこにつながっている部分(８近傍)をすべて「.」に置き換えるDFSをしていく．こうすることで，WとつながっているWは「.」に置き換わるため，Wがなくなるまでに何回DFSをしたかをカウントすればよい．状態の遷移は8方向の移動を各マスにしていくため$O(8 * M * N) = O( M * N )$である．  
```cpp
int m,n;
dx = [-1,-1,-1,0,0,1,1,1];
dy = [-1,0,1,-1,1,-1,0,1];
cin >> m >> n;
vector<vector<char>> field(n, vecotr<char>(m));
for(int i = 0; i < n; i++){
    for(int j = 0; j < m; j++){
        cin >> field[i][j];
    }
}
//現在位置(x,y)
void dfs(int x, int y){
    //現在位置の"W"を"."に変える
    field[y][x] = '.';

    //8近傍をループ
    for(int i = 0; i < 8; i++){
            //移動先を(nx,ny)とする
            int nx = x + dx[i];
            int ny = y + dy[i];

            //移動先が"W"ならdfsを続ける
            if( 0 <= nx && 0 <= ny && nx < m && ny < n && 
                field[ny][nx] == 'W') dfs(nx,ny);
        }
    return;
}

void solve(){
    int ans = 0;
    for(int i = 0; j < m; i++){
        for(int j = 0; i < n; j++){
            if(field[j][i] == 'W'){
                dfs(i,j);
                ans++;
            }
        }
    }
    cout << ans << "\n";
}
```
### 幅優先探索  
通称BFS(breadth first search)  
初期の状態から近いほうから順に走査していくアルゴリズムである．つまり，初期状態→1回の遷移でたどり着くすべての状態→2回の遷移でたどり着くすべての状態→...  
という順に探索していく．BFSでは同じ状態を1度しか通らないため，計算量は$O(状態数×遷移の仕方)$程度になる．  
深さ優先探索では(暗に)スタックを使っていたが，幅優先探索ではqueueを使う．具体的には，　　
1. 初期状態をキューに入れる
2. キューから状態を取り出し，そこから遷移できるすべての訪れたことのない状態をキューに入れる
3. 解が見つかるまで，2の繰り返し  

という手順である．

<div class = "box">

### 例題3：迷路の最短路  
大きさ$N×M$の迷路が与えられます．迷路は通路と壁からできており，1ターンに隣接する上下左右4マスの通路へ移動することが出来ます．スタートからゴールまで最低何ターンで移動できるかを求めなさい．ただし，迷路のゴール可能性は保証されているとします．  
制約：$N,M <= 100$  

</div>
  
方針：初期状態（スタート）は数値にエンコードでき，そこから4近傍を幅優先探索していく．計算量は$O(4×N×M)$となる．幅優先探索ではすでに訪れたかのフラグを管理しておけばたいてい簡単に解ける．今回は最短距離が必要なので，d[N][M]という配列で最短距離を管理する．初めにdを十分大きい定数INFで初期化することで，まだたどり着いてない場所がINFになり，フラグの役割も果たしている．  
```cpp
using p = pair<int, int>;

const int INF = 100000000;

int n,m;
int dx[4] = {-1,0,0,1};
int dy[4] = {0,-1,1,0};
cin >> n >> m;


vector<vector<char>> maze(n, vector<char>(m));
int sx,sy;
int gx,gy;
int d[n][m];//スタートから各点までの距離

for(int i = 0; i <  n; i++){
    for(int j = 0; j < m; j++){
        cin >> maze[i][j];
    }
}

//(sx,sy)から(gx,gy)への最短距離を求める．
int bfs(){
queue<p> que;
//すべての点をINFで初期化する
    for(int i = 0; i < n; i++){
        for(int j = 0; j < m; j++){
            d[i][j] = INF;
        }
    }
//スタート地点をキューに入れる
que.push({sx, sy});
//スタートの距離を0にする
d[sy][sx] = 0;

//キューが空になるまでループ
    while(que.size() != 0){
        p memo = que.front(); que.pop();
        if(memo.first == gx && memo.second == gy) break;
        //4近傍をループ
        for(int i = 0; i < 4; i++){
            int nx = memo.first + dx[i], ny = memo.second + dy[i];
            //移動が可能か，移動先が訪れたことがあるかの判定
            //移動先の座標が迷路の外じゃないか
            if(0 <= nx && nx < m && 0 < ny && ny <= n
            && maze[ny][nx] != '#' && d[ny][nx] == INF){
            //移動先が壁じゃないか，まだ行ったことがないか
            //移動できるなら，キューに入れ，その点の距離をmemoからの距離+1する．
            que.push({nx, ny});
            d[ny][nx] = d[memo.second][memo.first] + 1;
            }
        }
    }
    return d[gy][gx];
}

int ans = bfs();
cout << ans << "\n";
```
幅優先探索では状態をキューに入れていくため，状態数に比例してメモリを消費する．
そのため，メモリ使用量を抑える反復深さ優先探索(IDDFS:iterative deepening depth first search)というものもある．これは後で扱う．
### 特殊な状態の列挙
すべての解の候補を生成するには深さ優先探索を利用することがほとんどだが，特殊な状態空間の場合には，短く書く方法がある．例えば，C++の標準ライブラリにはnext_permutationという関数が用意されている．これは，n個の要素から順列を生成することが出来る．あるいはビット操作により，組み合わせや，集合のべき集合を列挙することが出来る．
next_permutationの例
```cpp
bool used[n];
int perm[n];

void permutation1(int pos, int n){
    if(pos == n){
        //permに対する操作
    }
    return;
}

//permのpos番目を0~n-1のどれかにするかのループ
for(int i = 0; i < n; i++){
    if(!used[i]){
        perm[pos] = i;
        used[i] = true;
        permutation1(pos + 1, n);
        used[i] = false;
    }
    return;
}
```