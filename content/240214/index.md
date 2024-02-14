---
emoji: 🧑🏻‍💻
title: '새롭게 도입될 React 19 hooks에 대해 알아보자'
date: '2024-02-14'
categories: Front-end React
---

# React 19에 도입될 Hooks

- use(Promise)
- use(Context)
- Form actions
- useFormState
- useFormStatus
- useOptimistic
- Bonus: Async transitions

<hr>

<br>

# use(Promise)

## Reference

- 컴포터는의 호출을 사용하여 Promise 또는 Context 와 같은 리소스의 값을 읽음
- use 는 if문과 같은 조건문 루프 안에서 호출 가능
- use 를 호출하는 함수는 컴포넌트 또는 Hook 이어야 함

```typescript
import { use } from 'react';

function MessageComponent({ messagePromise }) {
  const message = use(messagePromise);
  const theme = use(ThemeContext);
  // ...
```

Promise와 함께 호출될 때, use Hook은 Suspense 및 Error Boundaries와 통합된다. <br/>
use가 pending 상태일 때 Promise 가 전달완료 될 때까지 일시중단되고,
use를 호출하는 컴포넌트가 Suspense 경계로 래핑된 경우 대체 내용이 표시된다 <br/> Promise가 해결되면, Suspense 대체 내용이 use Hook에서 반환한 데이터를 사용하여 렌더링된 컴포넌트로 대체된다. <br/>
use에 전달된 Promise가 거부되면, 가장 가까운 Error Boundaries 의 대체 내용이 표시된다.

## Parameters

Promise, Context 형태의 데이터의 소스가 들어감

## Returns

use Hook 을 사용하면 Promise 의 return 값이나 Context 의 return 값을 반환

## 사용법

### Reading context with use

[context로 use를 사용하는 예시코드](https://codesandbox.io/p/sandbox/silly-dijkstra-68ryxj?file=/src/App.js)

context가 use로 전달되면 useContext와 유사하게 작동됨

useContext는 컴포넌트의 최상위 수준에서 호출해야 하지만, use는 if와 같은 조건문과 for와 같은 루프 내부에서 호출할 수 있고 사용이 더 유연하기 때문에 useContext보다 선호됨

use는 전달한 Context에 대한 Context Value를 반환함

```typescript

import { use } from 'react';

function Button() {
  const theme = use(ThemeContext);
// ...
```

Context Value을 결정하기 위해 React는 컴포넌트 트리를 검색하고 특정 Context의 위에서부터 가장 가까운 Context Provider를 찾음

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

Provider 와 버튼 사이에 얼마나 많은 컴포넌트 레이어가 있는지는 중요하지 않음. Form 내부의 버튼이 use(ThemeContext)를 호출하면 "dark"를 값으로 받음

useContext와 달리 use는 if와 같은 조건부 및 루프에서 호출할 수 있다.

use는 if 문 안에서 호출되므로 조건부로 Context에서 값을 읽을 수 있다

```typescript
function HorizontalRule({ show }) {
  if (show) {
    const theme = use(ThemeContext);
    return <hr className={theme} />;
  }
  return false;
}
```

## 사용시 주의해야될 점

use Hook 은 컴포넌트나 Hook 안에서 호출해야 됨

Server Component 에서 데이터를 가져올 때는 사용 use 보다 async 와 await 사용해야 됨

Client Component에서 Promise를 생성하는 것보다 Server Component에서 Promise를 생성하고 이를 Client Component로 전달하는 것을 선호함

Client Component에서 생성된 Promise는 렌더링할 때마다 재생성됨

Server Component에서 Client Component로 전달된 Promise는 다시 렌더링할 때 안정적임

useContext와 마찬가지로 use(context)는 항상 이를 호출하는 컴포넌트 위에서 가장 가까운 Context Provider 을 찾음 => 위쪽으로 검색하며 use를 호출하는 컴포넌트 내의 Context Provider는 고려하지 않음

## Example

[Server => Client로 데이터 스트리밍하는 예시코드](https://codesandbox.io/p/sandbox/happy-shadow-8dg646)

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

그런 다음 Client Component는 받은 Promise를 props로 가져와서 use Hook에 전달, 이렇게 하면 Client Component는 Server Component가 처음에 생성한 Promise에서 값을 읽을 수 있음

```typescript
// message.js
'use client';

import { use } from 'react';

export function Message({ messagePromise }) {
  const messageContent = use(messagePromise);
  return <p>Here is the message: {messageContent}</p>;
}
```

Message는 Suspense로 래핑되어 있으므로, Promise가 해결될 때까지 대체내용이 표시됨. Promise가 해결되면 Hook을 사용하여 값을 읽고 메시지 컴포넌트가 Suspense를 대체함.

<hr>
<br>

> <h2>📝 Note</h2>
>
> Server Component에서 Client Component로 Promise를 전달할 때, Server와 Client 간에 전달하려면 확인된 값이 직렬화 가능해야 함
>
> 함수와 같은 데이터 유형은 직렬화할 수 없으며 이러한 것은 Promise의 확인된 값이 될 수 없다.

> <h2>⁇ Question ⁇</h2>
> <h3>Server Component 또는 Client Component 에서 Promise를 해결해야 하나요? </h3>
>
> Promise는 Server Component에서 Client Component로 전달할 수 있고, Client Component에서 Hook을 사용하여 확인할 수 있다.
>
> Server Component에서 await을 사용하여 Promise를 확인하고 필요한 데이터를 Client Component에 프로퍼티로 전달할 수도 있다.
>
> 하지만 Server Component에서 await을 사용하면 await 문이 완료될 때까지 렌더링이 차단됨.
>
> Server Component에서 Client Component로 Promise를 전달하면 Promise가 Server Component의 렌더링을 차단하지 못하게 됨

## 거부된 Promise 처리하기

상황에 따라 사용하도록 전달된 Promise 가 거부될 수 있는데 그럴 때 아래 2가지 방법으로 처리할 수 있다.

> <h2>🚨 주의할 점</h2>
> use Hook 은 try-catch 로 호출할 수 없어서 아래 2가지 방법을 사용해야 됨.
>
> 사용하게 되면 **“Suspense Exception: This is not a real error!”** 에러가 발생함

### Error Boundary 가 있는 사용자에게 오류를 표시

[Error Boundary 를 이용한 오류 표시](https://codesandbox.io/p/sandbox/funny-cherry-dzl7jd?file=/src/message.js)

Promise가 거부될 때 사용자에게 오류를 표시하려면 Error Boundary 를 사용할 수 있다.

Error Boundary를 사용하려면 use Hook을 호출하는 컴포넌트를 Error Boundary로 감싸면 됨.

사용하도록 전달된 Promise가 거부되면 Error Boundary에 대한 대체내용이 표시됩니다.

### Promise.catch 를 사용하여 대체 값 제공

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

## Troubleshooting

```toc

```
