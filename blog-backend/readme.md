# 백엔드 프로그래밍: Node.js의 Koa 프레임워크

웹 애플리케이션을 만들 때는 리엑트 같은 프론트엔드 기술만으로 필요한 기능을 구현할 수 없는 경우가 있어

데이터를 여러 사람과 공유하려면 저장할 공간이 필요하다.<br />

### 백엔드

서버에 데이터를 담을 때는 여러 가지 규칙이 필요하다.

데이터를 등록할 때 사용자 인증 정보가 필요할 수도 있고, 등록할 데이터를 어떻게 검증할지, 데이터의 종류가 다양하다면 어떻게 구분할지 등 고려해야 할 것 들이 있다.

데이터를 조회할 때도 마찬가지이다. 어떤 종류의 데이터를 몇개씩 보여 줄지, 어떻게 보여 줄지 와 같은 로직을 만드는 것을 서버 프로그래밍, 백엔드 프로그래밍이라 한다.


### Node.js

자바스크립트 엔진을 기반으로 웹 브라우저뿐 아니라 서버에서도 자바스크립트를 사용할 수 있는 런타임이 개발되었는데, 이것이 Node.js이다.

### Koa

Node.js 환경에서 웹 서버를 구축할 때 보통 Express, Hapi, Koa 등의 웹 프레임워크를 사용한다.

Express는 미들웨어, 라우팅, 템플릿, 파일 호스팅 등과 같은 다양한 기능이 자체적으로 내장되어 있는 반면, 

Koa는 미들웨어 기능만 갖추고 있다. 나머지는 다른 라이브러리를 적용해야 한다.

라이브러리를 따로 적용해줘야 하는 번거로움이 있지만 그만큼 필요한 기능만 적용할 수 있어 Express 보다 가볍다.<br />

Koa는 async/await 문법을 정식으로 지원하기 때문에 비동기 작업을 더 편하게 관리할 수 있다.


## 작업 환경 준비

```
$ mkdir blog
$ cd blog
$ mkdir blog-backend
$ cd blog-backend
$ yarn init -y
```

mkdir로 폴더를 생성해줘도 되지만 탐색기를 이용해 직접 폴더를 생성해줘도 된다.


```
$ cat package.json
```
package.json도 blog-backend에서 직접 생성해줘도 된다.


```
$ yarn add koa
$ yarn add --dev eslint
$ yarn run eslint --init
? How would you like to use ESLint? To check syntax and find problems
? What type of modules does your project use? CommonJS (require/exports)
? Which framework does your project use? None of these
? which framework does your project use? No
? Where does your code run? Node 
? What format do you want your config file to be in? JSON
```

`.prettierrc` 생략



```
$ yarn add eslint-config-prettier
```

`.eslintrc.json`
```json
"extends" : ["eslint:recommended", "prettier"],
```


eslint가 const를 선언하고 사용하지 않아서 오류로 간주하기 때문에 제외시켜줘야 한다.

`.eslintrc.json`
```json
"rules": {
  "no-unused-vars": "warn",
  "no-console": "off"
}
```

src/index.js
```js
const Koa = require('koa');

const app = new Koa();

// app.use 에서 쓰이는 파라미터 ctx, next
// ctx = Context 의 줄임말, 웹 요청과 응답에 관한 정보
// next = 현재 처리 중인 미들웨어의 다음 미들웨어를 호출하는 함수
// next는 사용하지 않아도 됨.
// next 파라미터를 받고 next(); 사용하지 않아도 됨.
app.use((ctx, next) => {
  console.log(1);
  next();
});

app.use(ctx => {
  ctx.body='hello world';
});

// 간단히 포트만 열고 싶으면 app.listen() 만 사용하고
// 포트를 열고 실행시키고 싶은 것이 있으면 포트번호 뒤에 화살표 함수를 써준다.
app.listen(4000);

app.listen(4000, () => {
  console.log('Listening to port 4000');
});

```

```
$ node src
```

