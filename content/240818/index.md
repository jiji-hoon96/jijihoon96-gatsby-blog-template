---
emoji: 🤯
title: 'Zustand, 너 뭔데 Provider less 인 거야!?'
date: '2024-08-18'
categories: 프론트엔드 React
---

![1.jpg](1.jpg)

나는 Zustand가 Provider이 필요하지않는 상태관리 라이브러리라고 알고 있었다.

![2.jpeg](2.jpeg)

하지만 갑자기 생각이 들었다. 왜?? 어떻게 동작하기에 상태관리 라이브러리가 필요하지 않을까?

궁금해서 찾아보다가, 좋은 내용들이 많이 보여 공유하기 위해 기록해보려한다!

<br>

## 먼저 동작에 대해 생각해보자!

### 일반적인 React 상태 관리

일반적인 React 애플리케이션에서 상태는 다음과 같이 관리됩니다:

컴포넌트 내부 상태: useState 훅을 사용하여 관리
컴포넌트 트리를 통한 상태 전달: props를 통해 하위 컴포넌트로 전달
Context API: Provider 컴포넌트를 사용하여 하위 트리에 상태 제공

이러한 방식들은 모두 React 컴포넌트 트리 내부에서 상태를 관리합니다.

### Zustand 스토어에서는?

Zustand는 이와 다르게 작동합니다:

스토어 생성: React 컴포넌트 외부에서 스토어를 생성
모듈 스코프: 스토어는 JavaScript 모듈의 스코프 내에 존재
클로저 활용: 상태는 클로저를 통해 캡슐화됨

```typescript
import create from 'zustand';

// 이 스토어는 React 컴포넌트 외부에 생성됩니다
const useStore = create((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
}));

// React 컴포넌트
function Counter() {
  const { count, increment } = useStore();
  return <button onClick={increment}>{count}</button>;
}
```

### 컴포넌트 트리 외부?

"컴포넌트 트리 외부" 의미 해석

독립적인 존재: 스토어는 React의 생명주기나 렌더링 프로세스와 독립적으로 존재합니다.
전역 접근성: 애플리케이션의 어느 부분에서든 스토어에 접근할 수 있습니다. Provider로 감싸지 않아도 됩니다.
React와의 분리: 상태 로직이 React 컴포넌트 로직과 완전히 분리됩니다.
재사용성: 같은 스토어를 여러 React 애플리케이션이나 심지어 non-React 환경에서도 사용할 수 있습니다.
성능 최적화: React의 렌더링 사이클과 독립적으로 상태를 업데이트할 수 있어, 불필요한 리렌더링을 방지할 수 있습니다.

<br>

## Zustand 공식문서를 통해 살펴보자

```typescript
// import { useDebugValue, useSyncExternalStore } from 'react'
// That doesn't work in ESM, because React libs are CJS only.
// See: https://github.com/pmndrs/valtio/issues/452
// The following is a workaround until ESM is supported.
import ReactExports from 'react';
import { createStore } from './vanilla.ts';
import type { Mutate, StateCreator, StoreApi, StoreMutatorIdentifier } from './vanilla.ts';

const { useDebugValue, useSyncExternalStore } = ReactExports;

type ExtractState<S> = S extends { getState: () => infer T } ? T : never;

type ReadonlyStoreApi<T> = Pick<StoreApi<T>, 'getState' | 'getInitialState' | 'subscribe'>;

const identity = <T>(arg: T): T => arg;
export function useStore<S extends ReadonlyStoreApi<unknown>>(api: S): ExtractState<S>;

export function useStore<S extends ReadonlyStoreApi<unknown>, U>(api: S, selector: (state: ExtractState<S>) => U): U;

export function useStore<TState, StateSlice>(
  api: ReadonlyStoreApi<TState>,
  selector: (state: TState) => StateSlice = identity as any,
) {
  const slice = useSyncExternalStore(
    api.subscribe,
    () => selector(api.getState()),
    () => selector(api.getInitialState()),
  );
  useDebugValue(slice);
  return slice;
}

export type UseBoundStore<S extends ReadonlyStoreApi<unknown>> = {
  (): ExtractState<S>;
  <U>(selector: (state: ExtractState<S>) => U): U;
} & S;

type Create = {
  <T, Mos extends [StoreMutatorIdentifier, unknown][] = []>(initializer: StateCreator<T, [], Mos>): UseBoundStore<
    Mutate<StoreApi<T>, Mos>
  >;
  <T>(): <Mos extends [StoreMutatorIdentifier, unknown][] = []>(
    initializer: StateCreator<T, [], Mos>,
  ) => UseBoundStore<Mutate<StoreApi<T>, Mos>>;
};

const createImpl = <T>(createState: StateCreator<T, [], []>) => {
  const api = createStore(createState);

  const useBoundStore: any = (selector?: any) => useStore(api, selector);

  Object.assign(useBoundStore, api);

  return useBoundStore;
};

export const create = (<T>(createState: StateCreator<T, [], []> | undefined) =>
  createState ? createImpl(createState) : createImpl) as Create;
```

위 [공식문서 코드](https://github.com/pmndrs/zustand/blob/main/src/react.ts)를 통해 zustand에서 어떻게 스토어를 생성하고, 상태 접근 및 구독을 할지 알아보자

<br>

### 스토어 생성

```typescript
const createImpl = <T>(createState: StateCreator<T, [], []>) => {
  const api = createStore(createState);
  const useBoundStore: any = (selector?: any) => useStore(api, selector);
  Object.assign(useBoundStore, api);
  return useBoundStore;
};
```

createStore를 사용하여 상태와 관련 메서드를 포함하는 api 객체를 생성합니다.
useBoundStore 함수를 생성하여 useStore 훅을 통해 상태에 접근할 수 있게 합니다.
api 객체의 모든 속성과 메서드를 useBoundStore 함수에 할당합니다.

이 접근 방식으로 인해 스토어는 React 컴포넌트 트리 외부에 존재하게 되며, Provider로 감쌀 필요가 없어집니다.

### 상태 접근 및 구독

```typescript
export function useStore<TState, StateSlice>(
  api: ReadonlyStoreApi<TState>,
  selector: (state: TState) => StateSlice = identity as any,
) {
  const slice = useSyncExternalStore(
    api.subscribe,
    () => selector(api.getState()),
    () => selector(api.getInitialState()),
  );
  useDebugValue(slice);
  return slice;
}
```

useStore 훅은 다음과 같이 작동합니다:

useSyncExternalStore를 사용하여 외부 스토어(Zustand 스토어)와 동기화합니다.
api.subscribe를 통해 상태 변경을 구독합니다.
selector를 사용하여 필요한 상태 부분만 선택적으로 가져옵니다.
서버 사이드 렌더링을 위해 api.getInitialState()를 사용합니다.

이 방식으로 컴포넌트는 Provider 없이도 직접 스토어의 상태를 구독하고 업데이트를 받을 수 있습니다.

### 클로저를 통한 상태 관리

Zustand는 클로저를 사용하여 상태를 관리합니다. 이는 createStore 함수 내부에서 구현됩니다 (코드에는 나와있지 않지만, vanilla.ts에 구현되어 있을 것입니다).
클로저를 사용함으로써:

상태가 모듈 스코프 내에 안전하게 캡슐화됩니다.
외부에서 직접 상태를 수정할 수 없게 됩니다.
상태 업데이트 로직이 중앙화되어 관리됩니다.

### React Hooks와의 통합

```typescript
import ReactExports from 'react';
const { useDebugValue, useSyncExternalStore } = ReactExports;
```

Zustand는 React의 useSyncExternalStore 훅을 사용하여 React의 상태 관리 시스템과 원활하게 통합됩니다. 이를 통해:

React의 렌더링 사이클과 동기화됩니다.
불필요한 리렌더링을 방지합니다.
동시성 모드(Concurrent Mode)와 호환됩니다.

## 결론

Zustand의 Provider-less 설계는 다음과 같은 핵심 아이디어에 기반합니다:

스토어를 React 컴포넌트 트리 외부에 생성합니다.
클로저를 사용하여 상태를 캡슐화합니다.
React의 useSyncExternalStore를 활용하여 상태 변경을 효율적으로 구독합니다.
선택자(selector) 함수를 통해 필요한 상태만 컴포넌트에 제공합니다.

이러한 접근 방식으로 Zustand는 별도의 Provider 컴포넌트 없이도 효율적이고 유연한 상태 관리를 가능하게 합니다. 이는 코드의 복잡성을 줄이고, 상태 관리의 보일러플레이트를 최소화하는 데 기여합니다.

```toc

```
