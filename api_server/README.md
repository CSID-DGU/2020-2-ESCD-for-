1. 모듈 설치
Terminal에서 다음 명령어 입력

```
npm install
```

- Node.js를 설치한 상태여야 함.
- Terminal에서 api_server 경로로 들어가서 `npm install`을 쳐야 함.
- `npm install`을 통해 package.json 파일에 있는 `dependencies`가 설치되면 `node_modules` 폴더에 API 서버에 필요한 모듈들이 설치된다.

2. .env 파일 작성하기
- APi 서버의 root 경로(ESCD-FORYOU/api_server)에 .env 파일을 생성한다.
- 해당 파일에 들어갈 설정 값들은 다음과 같다.
```
// .env
PORT=서버를 가동할 PORT 번호(ex: PORT=8005)
JWT_SECRET=임의로설정(이 값은 로그인 인증에 쓰이는 jwt을 만드는데 쓰이는 key 값, admin_page_rendering_server 폴더 내에 .env 파일의 JWT_SECRET과 같아야 함, ex: JWT_SECRET=1234fasva)
APP_ID=위챗미니프로그램에서 발급받은 APP ID 명시(ex: APP_ID=wx13faweasfas)
APP_SECRET=위챗미니프로그램에서 발급받은 APP SECRET 명시(ex: APP_SECRET=124ewrtafs12312)
TEMPLATE_ID=위챗미니프로그램에서 발급받은 TEMPLATE ID 명시, 이 값은 수령 알림이나 취소 알림을 보내는데 사용됨(ex: TEMPLATE_ID=sfsdfavdsgaagas)
```

3. database 설정하기
-config 폴더의 config.json 파일은 데이터베이스 설정을 위한 파일이다.
-개발 환경, 프로덕션 환경 등 설정에 따라 자신의 데이터베이스명, 아이디, 비밀번호를 설정하면 된다.

4. 수령 알림 기능은 WeChat 개발자 등록이 되어 있어야만 가능