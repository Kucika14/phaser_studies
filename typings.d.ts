declare module '*.css' {
  interface IClassNames {
    [className: string]: string
  }

  const classNames: IClassNames
  export = classNames
}

declare module '*.json' {
  const value: any
  export default value
}

declare module '*.svg' {
  const s: string
  export = s
}

declare module '*.jpg' {
  const s: string
  export = s
}

declare module '*.png' {
  const s: string
  export = s
}

declare module '*.pug' {
  const func: Function
  export = func
}

declare module '*.mp3' {
  const s: string
  export = s
}

declare module '*.ogg' {
  const s: string
  export = s
}

interface ArrayConstructor { // eslint-disable-line @typescript-eslint/interface-name-prefix
  from(arrayLike: NodeList, mapFn?, thisArg?): any[]
}
