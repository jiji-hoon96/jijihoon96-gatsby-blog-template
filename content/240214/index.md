---
emoji: 🪝
title: '새롭게 도입될 React 19 hooks에 대해 알아보자'
date: '2024-02-14'
categories: Front-end React
---

![react-hooks](1.png)

&nbsp;

# React 19에 도입될 Hooks

&nbsp;

- [use(Promise) & use(Context)](#usepromise--usecontext)
- [Form actions](#form-actions)
- useFormState
- useFormStatus
- useOptimistic
- Bonus: Async transitions

> ✨ 잠깐 <span> 모든 코드는 [테스트 환경](https://react.dev/community/versioning-policy#canary-channel)</span> 에서 테스트 가능합니다. (단, React 19에 포함될 예정이지만 최종 release 전에 API가 변경될 수 있음)

&nbsp;

## use(Promise) & use(Context)

&nbsp;

### Reference

- 컴포터는의 호출을 사용하여 Promise 또는 Context 와 같은 리소스의 값을 읽음
- use는 if문과 같은 조건문 루프 안에서 호출 가능
- use를 호출하는 함수는 컴포넌트 또는 Hook 이어야 함

```typescript
import { use } from 'react';

function MessageComponent({ messagePromise }) {
  const message = use(messagePromise);
  const theme = use(ThemeContext);
  // ...
```

Promise와 함께 호출될 때, use는 Suspense 및 Error Boundaries와 통합된다.

use가 pending 상태일 때 Promise가 전달완료 될 때까지 일시중단되고, use를 호출하는 컴포넌트가 Suspense 경계로 래핑된 경우 대체 내용이 표시된다.

Promise가 해결되면 Suspense 대체 내용이 use에서 반환한 데이터를 사용하여 렌더링된 컴포넌트로 대체되고 거부되면 가장 가까운 Error Boundaries의 대체 내용이 표시된다.

&nbsp;

> <h3>✋ 그럼 client에서 데이터를 가져올 때 third-party library가 필요 없을까?</h3>

> TanStack Query 는 단순히 Promise 를 해결하는 것 이상의 기능을 수행하므로 아직은 지켜봐야 된다고 생각함!
>
> 하지만 올바른 방향으로 나아가는 훌륭한 단계라고 생각하며, REST 또는 GraphQL API를 기반으로 단일 페이지 앱을 더 쉽게 구축할 수 있게 해줄 거라고 생각함

&nbsp;

### use 문법

```typescript
const value = use(resource);
```

<h4>1. 매개변수</h4>

resource : Promise, Context 형태의 데이터의 소스가 들어감

<h4>2. 함수 호출 출력 값</h4>

use Hook 을 사용하면 Promise 의 return 값이나 Context 의 return 값을 반환

&nbsp;

### use 사용해보기

<span style="color: gray">[context로 use를 사용하는 예시코드](https://codesandbox.io/p/sandbox/silly-dijkstra-68ryxj?file=/src/App.js)</span>

context가 use로 전달되면 useContext와 유사하게 작동된다. 단, useContext는 컴포넌트의 최상위 수준에서 호출해야 하지만, use는 if와 같은 조건문과 for와 같은 루프 내부에서 호출할 수 있고 사용이 더 유연하기 때문에 useContext보다 선호됨

```typescript

import { use } from 'react';

function Button() {
  const theme = use(ThemeContext);
// ...
```

Context value를 결정하기 위해 React는 Component tree를 검색하고 특정 Context의 위에서부터 가장 가까운 Context Provider를 찾음

버튼에 Context 전달하려면 버튼 또는 그 부모 컴포넌트 중 하나를 해당 Context Provider 로 래핑해야됨

```typescript
function MyPage() {
  return (
    <ThemeContext.Provider value='dark'>
      <Form />
    </ThemeContext.Provider>
  );
}

function Form() {
  // ... renders buttons inside ...
}
```

Provider 와 버튼 사이에 얼마나 많은 컴포넌트 레이어가 있는지는 중요하지 않다. Form 내부의 버튼이 use(ThemeContext)를 호출하면 **dark**를 값으로 받음

```typescript
function HorizontalRule({ show }) {
  if (show) {
    const theme = use(ThemeContext);
    return <hr className={theme} />;
  }
  return false;
}
```

&nbsp;

### use 사용시 주의점

- use Hook 은 Component 또는 Hook 안에서 호출해야 됨

- Server Component 에서 데이터를 가져올 때는 use 보다 async 와 await 사용해야 됨

- React 팀에서는 Client Component에서 Promise를 생성하는 것보다 Server Component에서 Promise를 생성하고 이를 Client Component로 전달하는 것을 선호함

- Client Component에서 생성된 Promise는 렌더링할 때마다 재생성됨

- Server Component에서 Client Component로 전달된 Promise는 다시 렌더링할 때 안정적임

- useContext와 마찬가지로 use(context)는 항상 이를 호출하는 컴포넌트 위에서 가장 가까운 Context Provider 을 찾음 => 위쪽으로 검색하며 use를 호출하는 컴포넌트 내의 Context Provider는 고려하지 않음

&nbsp;

### Server => Client로 데이터 스트리밍

<span style="color: gray">[Server => Client로 데이터 스트리밍하는 예시코드](https://codesandbox.io/p/sandbox/happy-shadow-8dg646)</span>

Server Component에서 Client Component로 Promise를 props로 전달하여 Server에서 Client로 데이터를 스트리밍할 수 있음

```typescript
import { fetchMessage } from './lib.js';
import { Message } from './message.js';

export default function App() {
  const messagePromise = fetchMessage();
  return (
    <Suspense fallback={<p>waiting for message...</p>}>
      <Message messagePromise={messagePromise} />
    </Suspense>
  );
}
```

그런 다음 Client Component는 받은 Promise를 props로 가져와서 use에 전달, 이렇게 하면 Client Component는 Server Component가 처음에 생성한 Promise에서 값을 읽을 수 있음

```typescript
// message.js
'use client';

import { use } from 'react';

export function Message({ messagePromise }) {
  const messageContent = use(messagePromise);
  return <p>Here is the message: {messageContent}</p>;
}
```

Message는 Suspense로 래핑되어 있으므로, Promise가 해결될 때까지 대체내용이 표시되고 Promise가 해결되면 Hook을 사용하여 값을 읽고 메시지 컴포넌트가 Suspense를 대체함.

&nbsp;

> <h3>📝 Note</h3>
>
> Server Component에서 Client Component로 Promise를 전달할 때, Server와 Client 간에 전달하려면 값이 [직렬화](https://developer.mozilla.org/ko/docs/Glossary/Serializable_object)가 가능해야 함
>
> 함수와 같은 데이터 유형은 직렬화할 수 없으며 이러한 것은 Promise의 값이 될 수 없다.

&nbsp;

> <h3>🤔 Server 또는 Client Component 에서 Promise를 해결해야 하나요? </h3>
>
> Promise는 Server Component에서 Client Component로 전달할 수 있고, Client Component에서 Hook을 사용하여 확인할 수 있고, Server Component에서 await을 사용하여 Promise를 확인하고 필요한 데이터를 Client Component에 프로퍼티로 전달할 수도 있다.
>
> 하지만 Server Component에서 await을 사용하면 await 문이 완료될 때까지 렌더링이 차단된다. 하지만 Server Component에서 Client Component로 Promise를 전달하면 Promise가 Server Component의 렌더링을 차단하지 못하게 됨

&nbsp;

### 거부된 Promise 처리하기

<h4 style="color:red">🚨 주의할 점 🚨</h4>
<div style="opacity:0.5; margin-bottom:30px">

use Hook 은 try-catch 로 호출할 수 없어서 아래 2가지 방법을 사용해야 됨.

사용하게 되면 **“Suspense Exception: This is not a real error!”** 에러가 발생함

</div>

<div style="margin-bottom:40px">
<h4>1. Error Boundary 가 있는 사용자에게 오류를 표시</h4>

<span style="color: gray">[예시코드](https://codesandbox.io/p/sandbox/funny-cherry-dzl7jd?file=/src/message.js)</span>

Promise가 거부될 때 사용자에게 오류 표시를 Error Boundary 를 사용하면 되고, 사용하려면 use을 호출하는 컴포넌트를 Error Boundary로 감싸면 된다.

그러면 사용하도록 전달된 Promise가 거부될 때 Error Boundary에 대한 대체내용이 표시된다.

</div>

<h4>2. Promise.catch 를 사용하여 대체 값 제공</h4>

Promise의 catch 메서드를 사용하려면 Promise 객체에서 catch를 호출 한 후, catch를 통해 오류 메시지를 인자로 받는 함수인 단일 인수를 받음.

catch에 전달된 함수가 반환하는 값은 무엇이든 Promise의 확인된 값으로 사용

```typescript
import { Message } from './message.js';

export default function App() {
  const messagePromise = new Promise((resolve, reject) => {
    reject();
  }).catch(() => {
    return 'no new message found.';
  });

  return (
    <Suspense fallback={<p>waiting for message...</p>}>
      <Message messagePromise={messagePromise} />
    </Suspense>
  );
}
```

&nbsp;

## Form actions

Form actions을 사용하면 `<form>`요소의 `action` 속성에 함수를 전달할 수 있고, 폼이 제출될 때 React가 이 함수를 호출함.

```typescript
<form action={handleSubmit} />
```

React 18에서 `<form action>` 프로퍼티를 추가하면 아래 경고가 표시됨

> Warning: Invalid value for prop `action` on `<form>` tag. Either remove it from the element or pass a string or number value to keep it in the DOM.

&nbsp;

### Form actions 사용해보기

<span style="color:gray">[Form action 예시코드](https://stackblitz-starters-j6yogy.stackblitz.io)</span>

addToCart 함수는 Server action이 아니고, 클라이언트 측에서 호출되는 비동기 함수다.
이렇게 하면 검색 양식과 같이 React에서 AJAX 양식 처리를 크게 간소화할 수 있지만, 이것만으로는 Form 제출(유효성 검사, 부작용 등)을 처리하는 것 이상의 기능을 하는 <span style="color:gray">[React Hook Form](https://react-hook-form.com)</span>과 같은 서드파티 라이브러리를 제거하기에 충분하지 않다.

> 위 예시에서 Form 제출 중 Form 제출 버튼이 비활성화되지 않는 것, Confirm 메시지 누락, Cart 업데이트 지연 등 오류를 발견할 수 있지만, react 19 와 추후 업데이트에서 hook이 추가될 예정이라고 함.

&nbsp;

### Reference

```typescript
<form action={search}>
  <input name='query' />
  <button type='submit'>Search</button>
</form>
```

<h4>1. Props</h4>

`<form>` 은 모든 <span>[common element props](https://react.dev/reference/react-dom/components/common#props)</span>을 지원함

`action`: URL 또는 함수이다. URL이 `action`으로 전달되면 폼은 HTML 폼 구성 요소처럼 동작. 함수가 `action`으로 전달되면 해당 함수가 폼 제출을 처리한다. `action`으로 전달된 함수는 async일 수 있으며 제출된 폼의 폼 데이터가 포함된 단일 인수로 호출된다. `<button>` , `<input type="submit">` 또는 `<input type="image">` 컴포넌트의 `formAction` 속성으로 `action` prop을 재정의할 수 있습니다.

<h4>2. 주의사항 </h4>

함수가 `action` 또는 `formAction`으로 전달되면 메서드 속성의 값과 관계없이 HTTP 메서드는 POST로 설정됩니다.

#

```toc

```
