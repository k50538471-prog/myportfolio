---
title: "アセンブリを書いてみよう"
description: "アセンブリ言語で簡単なプログラミングをしてみる"
date: 2026-11-01
topic: "コンピュータ"
tags: ["プログラミング", "アセンブリ"]
toc: true
---
こんにちは，のんです
プログラミング言語の中で最も機械語に近いとされるアセンブリ言語を使って簡単なプログラミングをしてみようという記事です．
## アセンブリって？？
巷では書ける人は少なくなってるということらしいです(自分調べ)高級言語の登場のおかげ？
実行速度が早く，メモリの効率も良いとされているアセンブリですが，現代のコンパイラは最適化が進んでおり，例えばc++の処理速度とあまり差は無いです． 
ではどこで差別化されるのかというと，CPUのレジスタへや主記憶装置に対して，アクセスや命令の指定ができるという点です．一方メモリ効率がいいというのは半分事実です．メモリをどう使うかを細かく書けるため，メモリの効率性は書き方に依存し，上手な人が書けばそりゃ効率もぐんと高いわけです．  
書き手の技量が試されるというわけですね．殺すぞ～！とか言う人がいるかもしれません  
さて，アセンブラと似た言葉でアセンブリがありますが．
- アセンブリ(言語)は，書かれたプログラムを指します．機械語の命令を，人間が扱いやすい記号や文字列で表現したものです．コードのことですね！
- アセンブラはアセンブリ言語を機械語に対応する形式へ変換するソフトウェアです．コンパイラと似ていますが別件です．
さらに言うともう一つアセンブル(assemble)があるのですが．．．
詳しいことを書くと冗長になるので感覚的な部分でとどめておくことにします．

## 環境構築
今回はただの実験ということでdocker desktopで一時コンテナを作成しました．
まずはDockrfileです．ベースイメージはUbuntuをつかいます．アセンブラはnasmを使います．また，c言語の```puts()```を使いたいので，gccを入れています．
```
FROM ubuntu:latest

RUN apt update &&\
    apt install -y --no-install-recommends\
    nasm\
    gcc\
    binutils\
    gdb\
    make\
    && rm -rf /var/lib/apt/lists/*

WORKDIR /work
CMD [ "bash" ]
```
次にymlファイルです
```
services:
  asm:
    build: .
    container_name: test-asm
    volumes:
      - ./test:/work
    working_dir: /work
    stdin_open: true
    tty: true
```

## 使ってみよう
今回は四則演算の電卓を作ることを目標にします．

### まずはhelloworldから
アセンブリではラベルと値の対応が重要になってきます
```
ラベル:
    op オペランド, [オペランド2, ...]
    .
    .
    .
    
```
という構造になってるわけです．
関数に似ていますが違います．これは処理の位置に目印をつけているだけです．そのため必ずしも必要ではないです．
また今回nasmを使うのでそれに準拠した典型的な構文になっているためすべてのアセンブリに共通した文法というわけではないことに注意が必要．
```
global main
extern puts

section .data
    msg: db "hello world", 0

section .text
main:
    lea rdi, [rel msg]
    call puts
    xor eax, 0
    ret
```
```msg: db "hello world", 0```でmsgラベルをつけdbでメモリを確保しています．
putsの引数はrdiに格納されており，```lea rdi, [rel msg]```でrdiにmsgのアドレスを格納しています．
```
hello world
```
が表示されたら成功です．

### 電卓を作ってみよう

#### その前に1
例えば整数としての5という値と
文字列としての"5"という値は演算において意味が大きく変わります．
||値|表現|
|:-:|-:|-:|
|int 5|5|0x05|
|char 5|53|0x35|

というわけで整数を文字列に変換する必要があります．
0の文字コード0x30にintとして5を加えるだけなので簡単ですね．
というわけで例えば2+3はこんな感じにかけるわけです．
```
global main
extern puts

section .data
    msg db 0, 0

section .text
main:
    push rbp         ;rbp の値をスタックに保存する命令
    mov rbp, rsp     ;現在のスタック位置を、rbp にコピーする

    mov rax, 2       ; rax = 2
    add rax, 3       ; rax = 2 + 3 = 5
    add al, '0'      ; 数値5 → 文字'5'
    mov [rel msg], al

    lea rdi, [rel msg]
    call puts

    xor eax, 0
    pop rbp          ;保存しておいた古い rbp を復元
    ret
```

#### その前に2
入力処理も面倒なのでc言語のscanfを輸入します．
```
global main
extern scanf
extern puts

section .data
    fmt db "%ld", 0 ;format整数
    x   dq 0    ;8バイトの領域を確保
    msg db 0, 0

section .text
main:
    push rbp
    mov rbp, rsp

    lea rdi, [rel fmt]
    lea rsi, [rel x]
    xor eax, 0
    call scanf

    mov rax, [rel x]
    add al, "0"
    mov [rel msg], al

    lea rdi, [rel msg]
    call puts

    pop rbp
    ret
```
しかし現状1桁の正の数しか扱えません．そこで，whileに似たループを使います．
先ずループの開始位置に適当にラベルを作っておきます．次にループの終わりの位置に条件分岐とジャンプ用のコードを入れたら出来上がりです．
```
global main
extern puts

section .data
    msg times 21 db 0

section .text
main:
    push rbp
    mov rbp, rsp

    mov rax, 123
    mov rcx, 10
    lea r8, [rel msg + 19]

.loop:
    xor edx, edx
    div rcx ;raxは商
    
    add dl, '0'
    mov [r8], dl
    dec r8
    cmp rax, 0;raxと0を比較
    jne .loop ;0じゃなければloopラベルにジャンプ

    lea rdi, [r8 + 1]
    call puts

    xor eax, 0
    pop rbp
    ret
```
データ配列の最後尾から入れることで最大20桁の数字に対応できます．これで柔軟なoutputが可能に．
さらに条件分岐で負の数にも対応
```
global main
extern scanf
extern puts

section .data
    fmt db "%ld", 0 ;format整数
    x   dq 0    ;8バイトの領域を確保
    y   dq 0    ;8バイトの領域を確保
    msg times 21 db 0

section .text
main:
    push rbp
    mov rbp, rsp

;入力
    lea rdi, [rel fmt]
    lea rsi, [rel x]
    xor eax, 0
    call scanf

    lea rdi, [rel fmt]
    lea rsi, [rel y]
    xor eax, eax
    call scanf
;計算
    mov rax, [rel x]
    add rax, [rel y]
;出力
    mov rcx, 10
    lea r8, [rel msg + 19]

    cmp rax, 0
    jl .negative
    jmp .positive

.negative:
    neg rax
.loop1:
    xor edx, edx
    div rcx ;raxは商
    
    add dl, '0'
    mov [r8], dl
    dec r8
    cmp rax, 0;raxと0を比較
    jne .loop1 ;0じゃなければloopラベルにジャンプ
    mov byte [r8], "-"
    lea rdi, [r8]
    call puts
    jmp .end

.positive:
.loop2:
    xor edx, edx
    div rcx ;raxは商
    
    add dl, '0'
    mov [r8], dl
    dec r8
    cmp rax, 0;raxと0を比較
    jne .loop2 ;0じゃなければloopラベルにジャンプ

    lea rdi, [r8 + 1]
    call puts

.end:
    pop rbp
    ret
```
これでやっと土台が整いました．
## いざ電卓
以上で
-非負整数計算ができる
-値を表示することが出来る
-負の数に対応できる
など，ほとんどを作ることが出来ました．
次に四則演算について，一つだけ気を付けなければいけないのが，除算の部分で
```
mov rax, 10
cqo
idiv rbx
```
このように```cqo```というものを付けなければならない
cqoはraxをrdxに拡張するものでありこれにより，128ビットの被除数を正しく作れるようになります．
あとは各命令について```cmp```により比較し```je```で分岐を作っていくゾ．
もう一つ注意しなければならないことが残ってたゾ．
yが8バイトの整数であることです．
そのため
```
.division:
    cmp qword [rel y], 0
    je .erro
    cqo
    idiv qword [rel y]
    jmp .endcalc
```
このようにメモリのサイズが曖昧な命令については```qword```により8バイトであることを明記しなければいけません
当然指定しているデータごとに変わる(例えば4バイトなら```dword```)
これらに注意して完成したものがこちらになります．
`
global main
extern scanf
extern puts

section .data
    fmt db "%ld", 0 ;format整数
    x   dq 0    ;8バイトの領域を確保
    y   dq 0    ;8バイトの領域を確保
    msg times 21 db 0
    op db 0
    fmt_op db " %c", 0;演算子用のformat,char型
    erromsg db "error", 0

section .text
main:
    push rbp
    mov rbp, rsp

;入力
    lea rdi, [rel fmt]
    lea rsi, [rel x]
    xor eax, eax
    call scanf

    lea rdi, [rel fmt_op]
    lea rsi, [rel op]
    xor eax, eax
    call scanf

    lea rdi, [rel fmt]
    lea rsi, [rel y]
    xor eax, eax
    call scanf
;計算
    mov rax, [rel x]

    cmp byte [rel op], '+' 
    je .addition
    cmp byte [rel op], '-' 
    je .subtraction
    cmp byte [rel op], '*' 
    je .multiplication
    cmp byte [rel op], '/'
    je .division
    jmp .erro

.addition:
    add rax, [rel y]
    jmp .endcalc

.subtraction:
    sub rax, [rel y]
    jmp .endcalc

.multiplication:
    imul rax, [rel y]
    jmp .endcalc

.division:
    cmp qword [rel y], 0
    je .erro
    cqo
    idiv qword [rel y]
    jmp .endcalc

;出力
.endcalc:
    mov rcx, 10
    lea r8, [rel msg + 19]

    cmp rax, 0
    jl .negative
    jmp .positive

.negative:
    neg rax
.loop1:
    xor edx, edx
    div rcx ;raxは商
    
    add dl, '0'
    mov [r8], dl
    dec r8
    cmp rax, 0;raxと0を比較
    jne .loop1 ;0じゃなければloopラベルにジャンプ
    mov byte [r8], "-"
    lea rdi, [r8]
    call puts
    jmp .end

.positive:
.loop2:
    xor edx, edx
    div rcx ;raxは商
    
    add dl, '0'
    mov [r8], dl
    dec r8
    cmp rax, 0;raxと0を比較
    jne .loop2 ;0じゃなければloopラベルにジャンプ

    lea rdi, [r8 + 1]
    call puts
    jmp .end

.erro:
    lea rdi, [rel erromsg]
    call puts

.end:

    pop rbp
    ret
`
例外処理も入れてあげた素晴らしい電卓の完成です．ぜひオーバーフローさせて遊んで下さい．
## 終わりに
前編でほとんどの機能を付けてしまったため，わざわざ前編・後編に分ける必要があったかといわれるとないのですが，コードを貼っていくうちに記事がものすごく長くなってしまいました．そのため，読むことを考えると分けざるを得なかったということなんですね．
tipsになるのですがアセンブラをいちいち
```
	nasm -f elf64 (FILENAME).asm -o (FILENAME).o
	gcc -no-pie (FILENAME).o -o (FILENAME)
    ./(FILENAME)
```
こうやって動かさないとoutputをコマンドラインに表示できないんですyho
いちいち打ってられるかって話ですよばかばかしい．
そのため，Makefileなんかを使って一度にこれらを実行させるといいです．
ちなみに今回は
```
FILENAME ?= name

$(FILENAME): $(FILENAME).asm
	nasm -f elf64 $(FILENAME).asm -o $(FILENAME).o
	gcc -no-pie $(FILENAME).o -o $(FILENAME)

run: $(FILENAME)
	./$(FILENAME)

clean:
	rm -f $(FILENAME) $(FILENAME).o
```
これを使いました．これなら```make run FILENAME=(ファイル名)```で済むので効率的だね！
ということで今回初めてアセンブリを使ったわけなんですけど，これを人力で書いていた昔のプログラマの方々のすごさを身にしみて実感しました．
また，ここまで記事を読んでくださった方に感謝します．