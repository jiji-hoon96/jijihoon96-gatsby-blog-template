---
emoji: 🫵
title: '자바스크립트 Promise 직접 만들어보자. Promise 너 나와!'
date: '2024-05-25'
categories: 멘토링 자바스크립트
---

## Promise를 직접 만들어보자.

앞서 나는 Promise()에 대한 글을 2번 정도 게시했다.

- [자바스크립트 Promise를 퀴즈로 쉽게 익히기](https://hooninedev.com/240514/)
- [JavaScript 동기와 비동기 완벽 가이드](https://hooninedev.com/230816/)

위 글을 쓰고 나서 몇 달이 지난 현재, Promise의 내부는 어떻게 동작하고, 어떻게 구성이 되어있는지 궁금했다. 아티클을 읽던 와중에 **[푸만능님의 JavaScript Promise 객체 직접 구현해보기](https://velog.io/@turtle601/JS-%EC%9E%90%EB%B0%94%EC%8A%A4%ED%81%AC%EB%A6%BD%ED%8A%B8-Promise-%EA%B0%9D%EC%B2%B4-%EC%A7%81%EC%A0%91-%EA%B5%AC%ED%98%84%ED%95%B4%EB%B3%B4%EA%B8%B0#1-simplest-promise)를** 알게 되어서, 위 내용을 실습해보며 내가 새롭게 알게 된 내용들에 대해 공부해보려한다.

<br>

### Promise를 어떻게 만들어볼까?

Promise를 만들기 전에, Promise에 대해 이해해보기 위해, 기능 구현 목록을 작성해보자

우선 Promise는 실행 상태를 나타내기 때문에, **Pending(실행 전), fulfilled(실행 후 성공 => resolve), rejected(실행 후 실패 => rejected)이** 필요하다.

그리고 Promise는 JS 이벤트 루프에서 **Microtask Queue에서 비동기적으로 동작**한다. 또한 then, catch, finally이라는 후속처리 **메서드 체이닝**이 필요하다.

<br>

> 🤔 **메서드 체이닝(Method Chaining)이란?**
>
> 연속적인 코드 줄에서 개체의 Method를 반복적으로 호출하는 것을 의미한다. Method가 객체를 반환하면 그 반환 값(객체)
>
> 아래 함수를 Method Chaining을 이용하면 `store.enter(2).leave(1).enter(2)` 로 구현할 수 있다.
>
> ```javascript
> const store = {
>   name: 'see you',
>   opacity: 30,
>   peopleCount: 0,
>   enter(n) {
>     this.peopleCount += n;
>   },
>   leave(n) {
>     this.peopleCount -= n;
>   },
> };
> ```

<br>

물론 Promise를 위한 정적 메서드인 race(), all()등 다양한 함수등이 있지만 그런 것들은 추후에 공부해보자.

<br>

## 만들어보자.

![1.jpeg](1.jpeg)

본격적으로 Promise를 만들어보자. Promise를 구현해보면서 "이게 왜 이렇게 동작하지?", "이 개념은 뭐지?" 등 필요한 내용에 대해 차근차근 기록을 남기며 Promise를 만들어보겠다!

모든 것은 Github의 새로운 Repository와 함께한다. 레포를 통해 확인해봐도 좋다. 이름은 **[Mentoring 4주차 - PurePromise](https://github.com/jiji-hoon96/mentoring)**

<br>

### 간단하게 Promise를 만들어보자

```javascript
class MyPromise {
  #value = null;

  constructor(executor) {
    executor((value) => {
      this.#value = value;
    });
  }

  then(callback) {
    callback(this.#value);

    return this;
  }
}

function testMyPromise() {
  return new MyPromise((resolve) => {
    resolve('my resolve');
  });
}

testMyPromise().then((value) => console.log(value));
// my resolve
```

위 코드에서 신경써서 봐야 할 것은 3가지다.

- #value = null 을 통해 **#value라는 프라이빗 변수를 null로 초기값을 설정**했다.
- 생성자 함수는 **executor라는 함수를 매개변수**로 받는다.
- **then 메서드는 콜백 함수를 매개변수**로 받는다.

하지만 아직 부족한 점이 많다. 현재 만들어진 MyPromise 함수는 비동기 처리가 안되어있다. 또한 에러처리를 위한 catch문이 없고, 상태를 다루는 코드도 작성되어 있지 않다.

다음 섹션에서 에러처리에 대한 코드를 추가해보자.

<br>

### 간단하게 then, catch, resolve, reject 함수를 만들어보자

```javascript
class MyPromise {
  #value = null;

  constructor(executor) {
    this.#value = null;

    try {
      executor(this.#resolve.bind(this), this.#reject.bind(this));
    } catch (error) {
      this.#reject(error);
    }
  }

  #resolve(value) {
    this.#value = value;
  }

  #reject(error) {
    this.#value = error;
  }

  then(callback) {
    callback(this.#value);

    return this;
  }

  catch(callback) {
    callback(this.#value);

    return this;
  }
}

function testMyPromise() {
  return new MyPromise((resolve) => {
    resolve('my resolve');
  });
}

testMyPromise().then((value) => console.log(value)); // my resolve
```

resolve, reject, then, catch를 구현해서 메서드 체이닝이 일어날 수 있도록 했다.

위 코드에서 궁금한 점은 executor 내부에 bind 메서드를 사용했다는 점이다. 현재 bind 메서드를 사용했기 때문에 this는 항상 MyPromise 인스턴스를 가리킨다. 사용하지 않으면 resolve, reject 메서드를 호출할 때 this가 바뀔 수 있고, 특히 콜백함수에서 차이가 크게 날 수 있기 때문에 **bind 메서드로 강제로 특정 객체를 지정**하도록 해야 한다.

아직도 비동기, 상태 관리 메서드 생성, Error Handling이 부족하다. 다음 세션에서 더 보완해보자.

<br>

### Promise 상태를 추가해 동작 구현해보자.

## 출처 및 도움되는 링크들

- [Method Chaining](https://developerntraveler.tistory.com/116)
- [비동기, Promise, async, await 확실하게 이해하기](https://springfall.cc/article/2022-11/easy-promise-async-await)
- [Async/await 내부](https://velog.io/@gcback/Asyncawait-%EB%82%B4%EB%B6%80)
- [Generator](https://ko.javascript.info/generators)
- [Promise 생성자](https://developer.mozilla.org/ko/docs/Web/JavaScript/Reference/Global_Objects/Promise/Promise)
- [자바스크립트 Promise 객체 직접 구현해보기](https://velog.io/@turtle601/JS-%EC%9E%90%EB%B0%94%EC%8A%A4%ED%81%AC%EB%A6%BD%ED%8A%B8-Promise-%EA%B0%9D%EC%B2%B4-%EC%A7%81%EC%A0%91-%EA%B5%AC%ED%98%84%ED%95%B4%EB%B3%B4%EA%B8%B0#1-simplest-promise)

```toc

```
