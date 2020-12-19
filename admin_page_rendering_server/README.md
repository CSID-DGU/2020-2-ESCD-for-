1. 모듈 설치
Terminal에서 다음 명령어 입력
```
npm install
```

- Node.js를 설치한 상태여야 함.
- Terminal에서 api_server 경로로 들어가서 `npm install`을 쳐야 함.
- `npm install`을 통해 package.json 파일에 있는 `dependencies`가 설치되면 `node_modules` 폴더에 API 서버에 필요한 모듈들이 설치된다.

2. .env 파일 작성하기
- APi 서버의 root 경로(ESCD-FORYOU/admin_page_rendering_server)에 .env 파일을 생성한다.
- 해당 파일에 들어갈 설정 값들은 다음과 같다.
- 이 파일을 설정하지 않으면 메뉴 등록 시 이미지가 등록 과정에서 에러가 발생함
```
// .env
PORT=서버를가동할포트번호(ex: PORT=8000)
JWT_SECRET=임의로설정(이 값은 로그인 인증에 쓰이는 jwt을 만드는데 쓰이는 key 값, api_server 폴더 내에 .env 파일의 JWT_SECRET과 같아야 함, ex: JWT_SECRET=1234fasva)
ACCESS_KEY_ID=아마존S3버킷의ACCESS_KEY(ex: ACCESS_KLY_ID=12ASFAAAFsdaa)
SECRET_ACCESS_KEY=아마존S3버킷의SECRET ACCESS KEY(ex: SECRET_ACCESS_KEY=AIDs21j6U+afafasafasfa)
REGION=아마존S3버킷의리전(ex: REGIN=ap-northeast-2)
BUCKET=아마존S3버킷명(ex: BUCKET=wcthisforyou)
```

4. 수령 알림 기능은 WeChat 개발자 등록이 되어 있어야만 가능