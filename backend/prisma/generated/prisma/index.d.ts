
/**
 * Client
**/

import * as runtime from './runtime/library.js';
import $Types = runtime.Types // general types
import $Public = runtime.Types.Public
import $Utils = runtime.Types.Utils
import $Extensions = runtime.Types.Extensions
import $Result = runtime.Types.Result

export type PrismaPromise<T> = $Public.PrismaPromise<T>


/**
 * Model User
 * 
 */
export type User = $Result.DefaultSelection<Prisma.$UserPayload>
/**
 * Model Shift
 * 
 */
export type Shift = $Result.DefaultSelection<Prisma.$ShiftPayload>
/**
 * Model Absensi
 * 
 */
export type Absensi = $Result.DefaultSelection<Prisma.$AbsensiPayload>
/**
 * Model ShiftSwapRequest
 * 
 */
export type ShiftSwapRequest = $Result.DefaultSelection<Prisma.$ShiftSwapRequestPayload>

/**
 * Enums
 */
export namespace $Enums {
  export const Role: {
  ADMIN: 'ADMIN',
  DOKTER: 'DOKTER',
  PERAWAT: 'PERAWAT',
  STAF: 'STAF'
};

export type Role = (typeof Role)[keyof typeof Role]


export const AbsensiStatus: {
  HADIR: 'HADIR',
  TERLAMBAT: 'TERLAMBAT',
  SAKIT: 'SAKIT',
  IZIN: 'IZIN',
  ALPHA: 'ALPHA'
};

export type AbsensiStatus = (typeof AbsensiStatus)[keyof typeof AbsensiStatus]


export const SwapStatus: {
  PENDING: 'PENDING',
  DISETUJUI: 'DISETUJUI',
  DITOLAK: 'DITOLAK'
};

export type SwapStatus = (typeof SwapStatus)[keyof typeof SwapStatus]

}

export type Role = $Enums.Role

export const Role: typeof $Enums.Role

export type AbsensiStatus = $Enums.AbsensiStatus

export const AbsensiStatus: typeof $Enums.AbsensiStatus

export type SwapStatus = $Enums.SwapStatus

export const SwapStatus: typeof $Enums.SwapStatus

/**
 * ##  Prisma Client ʲˢ
 *
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient()
 * // Fetch zero or more Users
 * const users = await prisma.user.findMany()
 * ```
 *
 *
 * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
 */
export class PrismaClient<
  ClientOptions extends Prisma.PrismaClientOptions = Prisma.PrismaClientOptions,
  U = 'log' extends keyof ClientOptions ? ClientOptions['log'] extends Array<Prisma.LogLevel | Prisma.LogDefinition> ? Prisma.GetEvents<ClientOptions['log']> : never : never,
  ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
> {
  [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['other'] }

    /**
   * ##  Prisma Client ʲˢ
   *
   * Type-safe database client for TypeScript & Node.js
   * @example
   * ```
   * const prisma = new PrismaClient()
   * // Fetch zero or more Users
   * const users = await prisma.user.findMany()
   * ```
   *
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
   */

  constructor(optionsArg ?: Prisma.Subset<ClientOptions, Prisma.PrismaClientOptions>);
  $on<V extends U>(eventType: V, callback: (event: V extends 'query' ? Prisma.QueryEvent : Prisma.LogEvent) => void): PrismaClient;

  /**
   * Connect with the database
   */
  $connect(): $Utils.JsPromise<void>;

  /**
   * Disconnect from the database
   */
  $disconnect(): $Utils.JsPromise<void>;

  /**
   * Add a middleware
   * @deprecated since 4.16.0. For new code, prefer client extensions instead.
   * @see https://pris.ly/d/extensions
   */
  $use(cb: Prisma.Middleware): void

/**
   * Executes a prepared raw query and returns the number of affected rows.
   * @example
   * ```
   * const result = await prisma.$executeRaw`UPDATE User SET cool = ${true} WHERE email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Executes a raw query and returns the number of affected rows.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$executeRawUnsafe('UPDATE User SET cool = $1 WHERE email = $2 ;', true, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Performs a prepared raw query and returns the `SELECT` data.
   * @example
   * ```
   * const result = await prisma.$queryRaw`SELECT * FROM User WHERE id = ${1} OR email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<T>;

  /**
   * Performs a raw query and returns the `SELECT` data.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$queryRawUnsafe('SELECT * FROM User WHERE id = $1 OR email = $2;', 1, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<T>;


  /**
   * Allows the running of a sequence of read/write operations that are guaranteed to either succeed or fail as a whole.
   * @example
   * ```
   * const [george, bob, alice] = await prisma.$transaction([
   *   prisma.user.create({ data: { name: 'George' } }),
   *   prisma.user.create({ data: { name: 'Bob' } }),
   *   prisma.user.create({ data: { name: 'Alice' } }),
   * ])
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/concepts/components/prisma-client/transactions).
   */
  $transaction<P extends Prisma.PrismaPromise<any>[]>(arg: [...P], options?: { isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<runtime.Types.Utils.UnwrapTuple<P>>

  $transaction<R>(fn: (prisma: Omit<PrismaClient, runtime.ITXClientDenyList>) => $Utils.JsPromise<R>, options?: { maxWait?: number, timeout?: number, isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<R>


  $extends: $Extensions.ExtendsHook<"extends", Prisma.TypeMapCb<ClientOptions>, ExtArgs, $Utils.Call<Prisma.TypeMapCb<ClientOptions>, {
    extArgs: ExtArgs
  }>>

      /**
   * `prisma.user`: Exposes CRUD operations for the **User** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Users
    * const users = await prisma.user.findMany()
    * ```
    */
  get user(): Prisma.UserDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.shift`: Exposes CRUD operations for the **Shift** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Shifts
    * const shifts = await prisma.shift.findMany()
    * ```
    */
  get shift(): Prisma.ShiftDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.absensi`: Exposes CRUD operations for the **Absensi** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Absensis
    * const absensis = await prisma.absensi.findMany()
    * ```
    */
  get absensi(): Prisma.AbsensiDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.shiftSwapRequest`: Exposes CRUD operations for the **ShiftSwapRequest** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more ShiftSwapRequests
    * const shiftSwapRequests = await prisma.shiftSwapRequest.findMany()
    * ```
    */
  get shiftSwapRequest(): Prisma.ShiftSwapRequestDelegate<ExtArgs, ClientOptions>;
}

export namespace Prisma {
  export import DMMF = runtime.DMMF

  export type PrismaPromise<T> = $Public.PrismaPromise<T>

  /**
   * Validator
   */
  export import validator = runtime.Public.validator

  /**
   * Prisma Errors
   */
  export import PrismaClientKnownRequestError = runtime.PrismaClientKnownRequestError
  export import PrismaClientUnknownRequestError = runtime.PrismaClientUnknownRequestError
  export import PrismaClientRustPanicError = runtime.PrismaClientRustPanicError
  export import PrismaClientInitializationError = runtime.PrismaClientInitializationError
  export import PrismaClientValidationError = runtime.PrismaClientValidationError

  /**
   * Re-export of sql-template-tag
   */
  export import sql = runtime.sqltag
  export import empty = runtime.empty
  export import join = runtime.join
  export import raw = runtime.raw
  export import Sql = runtime.Sql



  /**
   * Decimal.js
   */
  export import Decimal = runtime.Decimal

  export type DecimalJsLike = runtime.DecimalJsLike

  /**
   * Metrics
   */
  export type Metrics = runtime.Metrics
  export type Metric<T> = runtime.Metric<T>
  export type MetricHistogram = runtime.MetricHistogram
  export type MetricHistogramBucket = runtime.MetricHistogramBucket

  /**
  * Extensions
  */
  export import Extension = $Extensions.UserArgs
  export import getExtensionContext = runtime.Extensions.getExtensionContext
  export import Args = $Public.Args
  export import Payload = $Public.Payload
  export import Result = $Public.Result
  export import Exact = $Public.Exact

  /**
   * Prisma Client JS version: 6.8.2
   * Query Engine version: 2060c79ba17c6bb9f5823312b6f6b7f4a845738e
   */
  export type PrismaVersion = {
    client: string
  }

  export const prismaVersion: PrismaVersion

  /**
   * Utility Types
   */


  export import JsonObject = runtime.JsonObject
  export import JsonArray = runtime.JsonArray
  export import JsonValue = runtime.JsonValue
  export import InputJsonObject = runtime.InputJsonObject
  export import InputJsonArray = runtime.InputJsonArray
  export import InputJsonValue = runtime.InputJsonValue

  /**
   * Types of the values used to represent different kinds of `null` values when working with JSON fields.
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  namespace NullTypes {
    /**
    * Type of `Prisma.DbNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.DbNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class DbNull {
      private DbNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.JsonNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.JsonNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class JsonNull {
      private JsonNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.AnyNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.AnyNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class AnyNull {
      private AnyNull: never
      private constructor()
    }
  }

  /**
   * Helper for filtering JSON entries that have `null` on the database (empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const DbNull: NullTypes.DbNull

  /**
   * Helper for filtering JSON entries that have JSON `null` values (not empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const JsonNull: NullTypes.JsonNull

  /**
   * Helper for filtering JSON entries that are `Prisma.DbNull` or `Prisma.JsonNull`
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const AnyNull: NullTypes.AnyNull

  type SelectAndInclude = {
    select: any
    include: any
  }

  type SelectAndOmit = {
    select: any
    omit: any
  }

  /**
   * Get the type of the value, that the Promise holds.
   */
  export type PromiseType<T extends PromiseLike<any>> = T extends PromiseLike<infer U> ? U : T;

  /**
   * Get the return type of a function which returns a Promise.
   */
  export type PromiseReturnType<T extends (...args: any) => $Utils.JsPromise<any>> = PromiseType<ReturnType<T>>

  /**
   * From T, pick a set of properties whose keys are in the union K
   */
  type Prisma__Pick<T, K extends keyof T> = {
      [P in K]: T[P];
  };


  export type Enumerable<T> = T | Array<T>;

  export type RequiredKeys<T> = {
    [K in keyof T]-?: {} extends Prisma__Pick<T, K> ? never : K
  }[keyof T]

  export type TruthyKeys<T> = keyof {
    [K in keyof T as T[K] extends false | undefined | null ? never : K]: K
  }

  export type TrueKeys<T> = TruthyKeys<Prisma__Pick<T, RequiredKeys<T>>>

  /**
   * Subset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection
   */
  export type Subset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
  };

  /**
   * SelectSubset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection.
   * Additionally, it validates, if both select and include are present. If the case, it errors.
   */
  export type SelectSubset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    (T extends SelectAndInclude
      ? 'Please either choose `select` or `include`.'
      : T extends SelectAndOmit
        ? 'Please either choose `select` or `omit`.'
        : {})

  /**
   * Subset + Intersection
   * @desc From `T` pick properties that exist in `U` and intersect `K`
   */
  export type SubsetIntersection<T, U, K> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    K

  type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };

  /**
   * XOR is needed to have a real mutually exclusive union type
   * https://stackoverflow.com/questions/42123407/does-typescript-support-mutually-exclusive-types
   */
  type XOR<T, U> =
    T extends object ?
    U extends object ?
      (Without<T, U> & U) | (Without<U, T> & T)
    : U : T


  /**
   * Is T a Record?
   */
  type IsObject<T extends any> = T extends Array<any>
  ? False
  : T extends Date
  ? False
  : T extends Uint8Array
  ? False
  : T extends BigInt
  ? False
  : T extends object
  ? True
  : False


  /**
   * If it's T[], return T
   */
  export type UnEnumerate<T extends unknown> = T extends Array<infer U> ? U : T

  /**
   * From ts-toolbelt
   */

  type __Either<O extends object, K extends Key> = Omit<O, K> &
    {
      // Merge all but K
      [P in K]: Prisma__Pick<O, P & keyof O> // With K possibilities
    }[K]

  type EitherStrict<O extends object, K extends Key> = Strict<__Either<O, K>>

  type EitherLoose<O extends object, K extends Key> = ComputeRaw<__Either<O, K>>

  type _Either<
    O extends object,
    K extends Key,
    strict extends Boolean
  > = {
    1: EitherStrict<O, K>
    0: EitherLoose<O, K>
  }[strict]

  type Either<
    O extends object,
    K extends Key,
    strict extends Boolean = 1
  > = O extends unknown ? _Either<O, K, strict> : never

  export type Union = any

  type PatchUndefined<O extends object, O1 extends object> = {
    [K in keyof O]: O[K] extends undefined ? At<O1, K> : O[K]
  } & {}

  /** Helper Types for "Merge" **/
  export type IntersectOf<U extends Union> = (
    U extends unknown ? (k: U) => void : never
  ) extends (k: infer I) => void
    ? I
    : never

  export type Overwrite<O extends object, O1 extends object> = {
      [K in keyof O]: K extends keyof O1 ? O1[K] : O[K];
  } & {};

  type _Merge<U extends object> = IntersectOf<Overwrite<U, {
      [K in keyof U]-?: At<U, K>;
  }>>;

  type Key = string | number | symbol;
  type AtBasic<O extends object, K extends Key> = K extends keyof O ? O[K] : never;
  type AtStrict<O extends object, K extends Key> = O[K & keyof O];
  type AtLoose<O extends object, K extends Key> = O extends unknown ? AtStrict<O, K> : never;
  export type At<O extends object, K extends Key, strict extends Boolean = 1> = {
      1: AtStrict<O, K>;
      0: AtLoose<O, K>;
  }[strict];

  export type ComputeRaw<A extends any> = A extends Function ? A : {
    [K in keyof A]: A[K];
  } & {};

  export type OptionalFlat<O> = {
    [K in keyof O]?: O[K];
  } & {};

  type _Record<K extends keyof any, T> = {
    [P in K]: T;
  };

  // cause typescript not to expand types and preserve names
  type NoExpand<T> = T extends unknown ? T : never;

  // this type assumes the passed object is entirely optional
  type AtLeast<O extends object, K extends string> = NoExpand<
    O extends unknown
    ? | (K extends keyof O ? { [P in K]: O[P] } & O : O)
      | {[P in keyof O as P extends K ? P : never]-?: O[P]} & O
    : never>;

  type _Strict<U, _U = U> = U extends unknown ? U & OptionalFlat<_Record<Exclude<Keys<_U>, keyof U>, never>> : never;

  export type Strict<U extends object> = ComputeRaw<_Strict<U>>;
  /** End Helper Types for "Merge" **/

  export type Merge<U extends object> = ComputeRaw<_Merge<Strict<U>>>;

  /**
  A [[Boolean]]
  */
  export type Boolean = True | False

  // /**
  // 1
  // */
  export type True = 1

  /**
  0
  */
  export type False = 0

  export type Not<B extends Boolean> = {
    0: 1
    1: 0
  }[B]

  export type Extends<A1 extends any, A2 extends any> = [A1] extends [never]
    ? 0 // anything `never` is false
    : A1 extends A2
    ? 1
    : 0

  export type Has<U extends Union, U1 extends Union> = Not<
    Extends<Exclude<U1, U>, U1>
  >

  export type Or<B1 extends Boolean, B2 extends Boolean> = {
    0: {
      0: 0
      1: 1
    }
    1: {
      0: 1
      1: 1
    }
  }[B1][B2]

  export type Keys<U extends Union> = U extends unknown ? keyof U : never

  type Cast<A, B> = A extends B ? A : B;

  export const type: unique symbol;



  /**
   * Used by group by
   */

  export type GetScalarType<T, O> = O extends object ? {
    [P in keyof T]: P extends keyof O
      ? O[P]
      : never
  } : never

  type FieldPaths<
    T,
    U = Omit<T, '_avg' | '_sum' | '_count' | '_min' | '_max'>
  > = IsObject<T> extends True ? U : T

  type GetHavingFields<T> = {
    [K in keyof T]: Or<
      Or<Extends<'OR', K>, Extends<'AND', K>>,
      Extends<'NOT', K>
    > extends True
      ? // infer is only needed to not hit TS limit
        // based on the brilliant idea of Pierre-Antoine Mills
        // https://github.com/microsoft/TypeScript/issues/30188#issuecomment-478938437
        T[K] extends infer TK
        ? GetHavingFields<UnEnumerate<TK> extends object ? Merge<UnEnumerate<TK>> : never>
        : never
      : {} extends FieldPaths<T[K]>
      ? never
      : K
  }[keyof T]

  /**
   * Convert tuple to union
   */
  type _TupleToUnion<T> = T extends (infer E)[] ? E : never
  type TupleToUnion<K extends readonly any[]> = _TupleToUnion<K>
  type MaybeTupleToUnion<T> = T extends any[] ? TupleToUnion<T> : T

  /**
   * Like `Pick`, but additionally can also accept an array of keys
   */
  type PickEnumerable<T, K extends Enumerable<keyof T> | keyof T> = Prisma__Pick<T, MaybeTupleToUnion<K>>

  /**
   * Exclude all keys with underscores
   */
  type ExcludeUnderscoreKeys<T extends string> = T extends `_${string}` ? never : T


  export type FieldRef<Model, FieldType> = runtime.FieldRef<Model, FieldType>

  type FieldRefInputType<Model, FieldType> = Model extends never ? never : FieldRef<Model, FieldType>


  export const ModelName: {
    User: 'User',
    Shift: 'Shift',
    Absensi: 'Absensi',
    ShiftSwapRequest: 'ShiftSwapRequest'
  };

  export type ModelName = (typeof ModelName)[keyof typeof ModelName]


  export type Datasources = {
    db?: Datasource
  }

  interface TypeMapCb<ClientOptions = {}> extends $Utils.Fn<{extArgs: $Extensions.InternalArgs }, $Utils.Record<string, any>> {
    returns: Prisma.TypeMap<this['params']['extArgs'], ClientOptions extends { omit: infer OmitOptions } ? OmitOptions : {}>
  }

  export type TypeMap<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> = {
    globalOmitOptions: {
      omit: GlobalOmitOptions
    }
    meta: {
      modelProps: "user" | "shift" | "absensi" | "shiftSwapRequest"
      txIsolationLevel: Prisma.TransactionIsolationLevel
    }
    model: {
      User: {
        payload: Prisma.$UserPayload<ExtArgs>
        fields: Prisma.UserFieldRefs
        operations: {
          findUnique: {
            args: Prisma.UserFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.UserFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          findFirst: {
            args: Prisma.UserFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.UserFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          findMany: {
            args: Prisma.UserFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>[]
          }
          create: {
            args: Prisma.UserCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          createMany: {
            args: Prisma.UserCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.UserCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>[]
          }
          delete: {
            args: Prisma.UserDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          update: {
            args: Prisma.UserUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          deleteMany: {
            args: Prisma.UserDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.UserUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.UserUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>[]
          }
          upsert: {
            args: Prisma.UserUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          aggregate: {
            args: Prisma.UserAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateUser>
          }
          groupBy: {
            args: Prisma.UserGroupByArgs<ExtArgs>
            result: $Utils.Optional<UserGroupByOutputType>[]
          }
          count: {
            args: Prisma.UserCountArgs<ExtArgs>
            result: $Utils.Optional<UserCountAggregateOutputType> | number
          }
        }
      }
      Shift: {
        payload: Prisma.$ShiftPayload<ExtArgs>
        fields: Prisma.ShiftFieldRefs
        operations: {
          findUnique: {
            args: Prisma.ShiftFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ShiftPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.ShiftFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ShiftPayload>
          }
          findFirst: {
            args: Prisma.ShiftFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ShiftPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.ShiftFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ShiftPayload>
          }
          findMany: {
            args: Prisma.ShiftFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ShiftPayload>[]
          }
          create: {
            args: Prisma.ShiftCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ShiftPayload>
          }
          createMany: {
            args: Prisma.ShiftCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.ShiftCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ShiftPayload>[]
          }
          delete: {
            args: Prisma.ShiftDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ShiftPayload>
          }
          update: {
            args: Prisma.ShiftUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ShiftPayload>
          }
          deleteMany: {
            args: Prisma.ShiftDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.ShiftUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.ShiftUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ShiftPayload>[]
          }
          upsert: {
            args: Prisma.ShiftUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ShiftPayload>
          }
          aggregate: {
            args: Prisma.ShiftAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateShift>
          }
          groupBy: {
            args: Prisma.ShiftGroupByArgs<ExtArgs>
            result: $Utils.Optional<ShiftGroupByOutputType>[]
          }
          count: {
            args: Prisma.ShiftCountArgs<ExtArgs>
            result: $Utils.Optional<ShiftCountAggregateOutputType> | number
          }
        }
      }
      Absensi: {
        payload: Prisma.$AbsensiPayload<ExtArgs>
        fields: Prisma.AbsensiFieldRefs
        operations: {
          findUnique: {
            args: Prisma.AbsensiFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AbsensiPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.AbsensiFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AbsensiPayload>
          }
          findFirst: {
            args: Prisma.AbsensiFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AbsensiPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.AbsensiFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AbsensiPayload>
          }
          findMany: {
            args: Prisma.AbsensiFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AbsensiPayload>[]
          }
          create: {
            args: Prisma.AbsensiCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AbsensiPayload>
          }
          createMany: {
            args: Prisma.AbsensiCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.AbsensiCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AbsensiPayload>[]
          }
          delete: {
            args: Prisma.AbsensiDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AbsensiPayload>
          }
          update: {
            args: Prisma.AbsensiUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AbsensiPayload>
          }
          deleteMany: {
            args: Prisma.AbsensiDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.AbsensiUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.AbsensiUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AbsensiPayload>[]
          }
          upsert: {
            args: Prisma.AbsensiUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AbsensiPayload>
          }
          aggregate: {
            args: Prisma.AbsensiAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateAbsensi>
          }
          groupBy: {
            args: Prisma.AbsensiGroupByArgs<ExtArgs>
            result: $Utils.Optional<AbsensiGroupByOutputType>[]
          }
          count: {
            args: Prisma.AbsensiCountArgs<ExtArgs>
            result: $Utils.Optional<AbsensiCountAggregateOutputType> | number
          }
        }
      }
      ShiftSwapRequest: {
        payload: Prisma.$ShiftSwapRequestPayload<ExtArgs>
        fields: Prisma.ShiftSwapRequestFieldRefs
        operations: {
          findUnique: {
            args: Prisma.ShiftSwapRequestFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ShiftSwapRequestPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.ShiftSwapRequestFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ShiftSwapRequestPayload>
          }
          findFirst: {
            args: Prisma.ShiftSwapRequestFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ShiftSwapRequestPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.ShiftSwapRequestFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ShiftSwapRequestPayload>
          }
          findMany: {
            args: Prisma.ShiftSwapRequestFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ShiftSwapRequestPayload>[]
          }
          create: {
            args: Prisma.ShiftSwapRequestCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ShiftSwapRequestPayload>
          }
          createMany: {
            args: Prisma.ShiftSwapRequestCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.ShiftSwapRequestCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ShiftSwapRequestPayload>[]
          }
          delete: {
            args: Prisma.ShiftSwapRequestDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ShiftSwapRequestPayload>
          }
          update: {
            args: Prisma.ShiftSwapRequestUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ShiftSwapRequestPayload>
          }
          deleteMany: {
            args: Prisma.ShiftSwapRequestDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.ShiftSwapRequestUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.ShiftSwapRequestUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ShiftSwapRequestPayload>[]
          }
          upsert: {
            args: Prisma.ShiftSwapRequestUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ShiftSwapRequestPayload>
          }
          aggregate: {
            args: Prisma.ShiftSwapRequestAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateShiftSwapRequest>
          }
          groupBy: {
            args: Prisma.ShiftSwapRequestGroupByArgs<ExtArgs>
            result: $Utils.Optional<ShiftSwapRequestGroupByOutputType>[]
          }
          count: {
            args: Prisma.ShiftSwapRequestCountArgs<ExtArgs>
            result: $Utils.Optional<ShiftSwapRequestCountAggregateOutputType> | number
          }
        }
      }
    }
  } & {
    other: {
      payload: any
      operations: {
        $executeRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $executeRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
        $queryRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $queryRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
      }
    }
  }
  export const defineExtension: $Extensions.ExtendsHook<"define", Prisma.TypeMapCb, $Extensions.DefaultArgs>
  export type DefaultPrismaClient = PrismaClient
  export type ErrorFormat = 'pretty' | 'colorless' | 'minimal'
  export interface PrismaClientOptions {
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasources?: Datasources
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasourceUrl?: string
    /**
     * @default "colorless"
     */
    errorFormat?: ErrorFormat
    /**
     * @example
     * ```
     * // Defaults to stdout
     * log: ['query', 'info', 'warn', 'error']
     * 
     * // Emit as events
     * log: [
     *   { emit: 'stdout', level: 'query' },
     *   { emit: 'stdout', level: 'info' },
     *   { emit: 'stdout', level: 'warn' }
     *   { emit: 'stdout', level: 'error' }
     * ]
     * ```
     * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/logging#the-log-option).
     */
    log?: (LogLevel | LogDefinition)[]
    /**
     * The default values for transactionOptions
     * maxWait ?= 2000
     * timeout ?= 5000
     */
    transactionOptions?: {
      maxWait?: number
      timeout?: number
      isolationLevel?: Prisma.TransactionIsolationLevel
    }
    /**
     * Global configuration for omitting model fields by default.
     * 
     * @example
     * ```
     * const prisma = new PrismaClient({
     *   omit: {
     *     user: {
     *       password: true
     *     }
     *   }
     * })
     * ```
     */
    omit?: Prisma.GlobalOmitConfig
  }
  export type GlobalOmitConfig = {
    user?: UserOmit
    shift?: ShiftOmit
    absensi?: AbsensiOmit
    shiftSwapRequest?: ShiftSwapRequestOmit
  }

  /* Types for Logging */
  export type LogLevel = 'info' | 'query' | 'warn' | 'error'
  export type LogDefinition = {
    level: LogLevel
    emit: 'stdout' | 'event'
  }

  export type GetLogType<T extends LogLevel | LogDefinition> = T extends LogDefinition ? T['emit'] extends 'event' ? T['level'] : never : never
  export type GetEvents<T extends any> = T extends Array<LogLevel | LogDefinition> ?
    GetLogType<T[0]> | GetLogType<T[1]> | GetLogType<T[2]> | GetLogType<T[3]>
    : never

  export type QueryEvent = {
    timestamp: Date
    query: string
    params: string
    duration: number
    target: string
  }

  export type LogEvent = {
    timestamp: Date
    message: string
    target: string
  }
  /* End Types for Logging */


  export type PrismaAction =
    | 'findUnique'
    | 'findUniqueOrThrow'
    | 'findMany'
    | 'findFirst'
    | 'findFirstOrThrow'
    | 'create'
    | 'createMany'
    | 'createManyAndReturn'
    | 'update'
    | 'updateMany'
    | 'updateManyAndReturn'
    | 'upsert'
    | 'delete'
    | 'deleteMany'
    | 'executeRaw'
    | 'queryRaw'
    | 'aggregate'
    | 'count'
    | 'runCommandRaw'
    | 'findRaw'
    | 'groupBy'

  /**
   * These options are being passed into the middleware as "params"
   */
  export type MiddlewareParams = {
    model?: ModelName
    action: PrismaAction
    args: any
    dataPath: string[]
    runInTransaction: boolean
  }

  /**
   * The `T` type makes sure, that the `return proceed` is not forgotten in the middleware implementation
   */
  export type Middleware<T = any> = (
    params: MiddlewareParams,
    next: (params: MiddlewareParams) => $Utils.JsPromise<T>,
  ) => $Utils.JsPromise<T>

  // tested in getLogLevel.test.ts
  export function getLogLevel(log: Array<LogLevel | LogDefinition>): LogLevel | undefined;

  /**
   * `PrismaClient` proxy available in interactive transactions.
   */
  export type TransactionClient = Omit<Prisma.DefaultPrismaClient, runtime.ITXClientDenyList>

  export type Datasource = {
    url?: string
  }

  /**
   * Count Types
   */


  /**
   * Count Type UserCountOutputType
   */

  export type UserCountOutputType = {
    absensi: number
    shift: number
    shiftRequestsPengaju: number
    shiftRequestsTarget: number
  }

  export type UserCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    absensi?: boolean | UserCountOutputTypeCountAbsensiArgs
    shift?: boolean | UserCountOutputTypeCountShiftArgs
    shiftRequestsPengaju?: boolean | UserCountOutputTypeCountShiftRequestsPengajuArgs
    shiftRequestsTarget?: boolean | UserCountOutputTypeCountShiftRequestsTargetArgs
  }

  // Custom InputTypes
  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserCountOutputType
     */
    select?: UserCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountAbsensiArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: AbsensiWhereInput
  }

  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountShiftArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ShiftWhereInput
  }

  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountShiftRequestsPengajuArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ShiftSwapRequestWhereInput
  }

  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountShiftRequestsTargetArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ShiftSwapRequestWhereInput
  }


  /**
   * Count Type ShiftCountOutputType
   */

  export type ShiftCountOutputType = {
    swapRequests: number
  }

  export type ShiftCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    swapRequests?: boolean | ShiftCountOutputTypeCountSwapRequestsArgs
  }

  // Custom InputTypes
  /**
   * ShiftCountOutputType without action
   */
  export type ShiftCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ShiftCountOutputType
     */
    select?: ShiftCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * ShiftCountOutputType without action
   */
  export type ShiftCountOutputTypeCountSwapRequestsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ShiftSwapRequestWhereInput
  }


  /**
   * Models
   */

  /**
   * Model User
   */

  export type AggregateUser = {
    _count: UserCountAggregateOutputType | null
    _avg: UserAvgAggregateOutputType | null
    _sum: UserSumAggregateOutputType | null
    _min: UserMinAggregateOutputType | null
    _max: UserMaxAggregateOutputType | null
  }

  export type UserAvgAggregateOutputType = {
    id: number | null
  }

  export type UserSumAggregateOutputType = {
    id: number | null
  }

  export type UserMinAggregateOutputType = {
    id: number | null
    nama: string | null
    email: string | null
    password: string | null
    role: $Enums.Role | null
    nomorHP: string | null
    idPegawai: string | null
    unitKerja: string | null
    createdAt: Date | null
  }

  export type UserMaxAggregateOutputType = {
    id: number | null
    nama: string | null
    email: string | null
    password: string | null
    role: $Enums.Role | null
    nomorHP: string | null
    idPegawai: string | null
    unitKerja: string | null
    createdAt: Date | null
  }

  export type UserCountAggregateOutputType = {
    id: number
    nama: number
    email: number
    password: number
    role: number
    nomorHP: number
    idPegawai: number
    unitKerja: number
    createdAt: number
    _all: number
  }


  export type UserAvgAggregateInputType = {
    id?: true
  }

  export type UserSumAggregateInputType = {
    id?: true
  }

  export type UserMinAggregateInputType = {
    id?: true
    nama?: true
    email?: true
    password?: true
    role?: true
    nomorHP?: true
    idPegawai?: true
    unitKerja?: true
    createdAt?: true
  }

  export type UserMaxAggregateInputType = {
    id?: true
    nama?: true
    email?: true
    password?: true
    role?: true
    nomorHP?: true
    idPegawai?: true
    unitKerja?: true
    createdAt?: true
  }

  export type UserCountAggregateInputType = {
    id?: true
    nama?: true
    email?: true
    password?: true
    role?: true
    nomorHP?: true
    idPegawai?: true
    unitKerja?: true
    createdAt?: true
    _all?: true
  }

  export type UserAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which User to aggregate.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Users
    **/
    _count?: true | UserCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: UserAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: UserSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: UserMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: UserMaxAggregateInputType
  }

  export type GetUserAggregateType<T extends UserAggregateArgs> = {
        [P in keyof T & keyof AggregateUser]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateUser[P]>
      : GetScalarType<T[P], AggregateUser[P]>
  }




  export type UserGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: UserWhereInput
    orderBy?: UserOrderByWithAggregationInput | UserOrderByWithAggregationInput[]
    by: UserScalarFieldEnum[] | UserScalarFieldEnum
    having?: UserScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: UserCountAggregateInputType | true
    _avg?: UserAvgAggregateInputType
    _sum?: UserSumAggregateInputType
    _min?: UserMinAggregateInputType
    _max?: UserMaxAggregateInputType
  }

  export type UserGroupByOutputType = {
    id: number
    nama: string
    email: string
    password: string
    role: $Enums.Role
    nomorHP: string | null
    idPegawai: string
    unitKerja: string | null
    createdAt: Date
    _count: UserCountAggregateOutputType | null
    _avg: UserAvgAggregateOutputType | null
    _sum: UserSumAggregateOutputType | null
    _min: UserMinAggregateOutputType | null
    _max: UserMaxAggregateOutputType | null
  }

  type GetUserGroupByPayload<T extends UserGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<UserGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof UserGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], UserGroupByOutputType[P]>
            : GetScalarType<T[P], UserGroupByOutputType[P]>
        }
      >
    >


  export type UserSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    nama?: boolean
    email?: boolean
    password?: boolean
    role?: boolean
    nomorHP?: boolean
    idPegawai?: boolean
    unitKerja?: boolean
    createdAt?: boolean
    absensi?: boolean | User$absensiArgs<ExtArgs>
    shift?: boolean | User$shiftArgs<ExtArgs>
    shiftRequestsPengaju?: boolean | User$shiftRequestsPengajuArgs<ExtArgs>
    shiftRequestsTarget?: boolean | User$shiftRequestsTargetArgs<ExtArgs>
    _count?: boolean | UserCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["user"]>

  export type UserSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    nama?: boolean
    email?: boolean
    password?: boolean
    role?: boolean
    nomorHP?: boolean
    idPegawai?: boolean
    unitKerja?: boolean
    createdAt?: boolean
  }, ExtArgs["result"]["user"]>

  export type UserSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    nama?: boolean
    email?: boolean
    password?: boolean
    role?: boolean
    nomorHP?: boolean
    idPegawai?: boolean
    unitKerja?: boolean
    createdAt?: boolean
  }, ExtArgs["result"]["user"]>

  export type UserSelectScalar = {
    id?: boolean
    nama?: boolean
    email?: boolean
    password?: boolean
    role?: boolean
    nomorHP?: boolean
    idPegawai?: boolean
    unitKerja?: boolean
    createdAt?: boolean
  }

  export type UserOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "nama" | "email" | "password" | "role" | "nomorHP" | "idPegawai" | "unitKerja" | "createdAt", ExtArgs["result"]["user"]>
  export type UserInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    absensi?: boolean | User$absensiArgs<ExtArgs>
    shift?: boolean | User$shiftArgs<ExtArgs>
    shiftRequestsPengaju?: boolean | User$shiftRequestsPengajuArgs<ExtArgs>
    shiftRequestsTarget?: boolean | User$shiftRequestsTargetArgs<ExtArgs>
    _count?: boolean | UserCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type UserIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}
  export type UserIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $UserPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "User"
    objects: {
      absensi: Prisma.$AbsensiPayload<ExtArgs>[]
      shift: Prisma.$ShiftPayload<ExtArgs>[]
      shiftRequestsPengaju: Prisma.$ShiftSwapRequestPayload<ExtArgs>[]
      shiftRequestsTarget: Prisma.$ShiftSwapRequestPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: number
      nama: string
      email: string
      password: string
      role: $Enums.Role
      nomorHP: string | null
      idPegawai: string
      unitKerja: string | null
      createdAt: Date
    }, ExtArgs["result"]["user"]>
    composites: {}
  }

  type UserGetPayload<S extends boolean | null | undefined | UserDefaultArgs> = $Result.GetResult<Prisma.$UserPayload, S>

  type UserCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<UserFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: UserCountAggregateInputType | true
    }

  export interface UserDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['User'], meta: { name: 'User' } }
    /**
     * Find zero or one User that matches the filter.
     * @param {UserFindUniqueArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends UserFindUniqueArgs>(args: SelectSubset<T, UserFindUniqueArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one User that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {UserFindUniqueOrThrowArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends UserFindUniqueOrThrowArgs>(args: SelectSubset<T, UserFindUniqueOrThrowArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first User that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindFirstArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends UserFindFirstArgs>(args?: SelectSubset<T, UserFindFirstArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first User that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindFirstOrThrowArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends UserFindFirstOrThrowArgs>(args?: SelectSubset<T, UserFindFirstOrThrowArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Users that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Users
     * const users = await prisma.user.findMany()
     * 
     * // Get first 10 Users
     * const users = await prisma.user.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const userWithIdOnly = await prisma.user.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends UserFindManyArgs>(args?: SelectSubset<T, UserFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a User.
     * @param {UserCreateArgs} args - Arguments to create a User.
     * @example
     * // Create one User
     * const User = await prisma.user.create({
     *   data: {
     *     // ... data to create a User
     *   }
     * })
     * 
     */
    create<T extends UserCreateArgs>(args: SelectSubset<T, UserCreateArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Users.
     * @param {UserCreateManyArgs} args - Arguments to create many Users.
     * @example
     * // Create many Users
     * const user = await prisma.user.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends UserCreateManyArgs>(args?: SelectSubset<T, UserCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Users and returns the data saved in the database.
     * @param {UserCreateManyAndReturnArgs} args - Arguments to create many Users.
     * @example
     * // Create many Users
     * const user = await prisma.user.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Users and only return the `id`
     * const userWithIdOnly = await prisma.user.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends UserCreateManyAndReturnArgs>(args?: SelectSubset<T, UserCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a User.
     * @param {UserDeleteArgs} args - Arguments to delete one User.
     * @example
     * // Delete one User
     * const User = await prisma.user.delete({
     *   where: {
     *     // ... filter to delete one User
     *   }
     * })
     * 
     */
    delete<T extends UserDeleteArgs>(args: SelectSubset<T, UserDeleteArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one User.
     * @param {UserUpdateArgs} args - Arguments to update one User.
     * @example
     * // Update one User
     * const user = await prisma.user.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends UserUpdateArgs>(args: SelectSubset<T, UserUpdateArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Users.
     * @param {UserDeleteManyArgs} args - Arguments to filter Users to delete.
     * @example
     * // Delete a few Users
     * const { count } = await prisma.user.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends UserDeleteManyArgs>(args?: SelectSubset<T, UserDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Users.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Users
     * const user = await prisma.user.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends UserUpdateManyArgs>(args: SelectSubset<T, UserUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Users and returns the data updated in the database.
     * @param {UserUpdateManyAndReturnArgs} args - Arguments to update many Users.
     * @example
     * // Update many Users
     * const user = await prisma.user.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Users and only return the `id`
     * const userWithIdOnly = await prisma.user.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends UserUpdateManyAndReturnArgs>(args: SelectSubset<T, UserUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one User.
     * @param {UserUpsertArgs} args - Arguments to update or create a User.
     * @example
     * // Update or create a User
     * const user = await prisma.user.upsert({
     *   create: {
     *     // ... data to create a User
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the User we want to update
     *   }
     * })
     */
    upsert<T extends UserUpsertArgs>(args: SelectSubset<T, UserUpsertArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Users.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserCountArgs} args - Arguments to filter Users to count.
     * @example
     * // Count the number of Users
     * const count = await prisma.user.count({
     *   where: {
     *     // ... the filter for the Users we want to count
     *   }
     * })
    **/
    count<T extends UserCountArgs>(
      args?: Subset<T, UserCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], UserCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a User.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends UserAggregateArgs>(args: Subset<T, UserAggregateArgs>): Prisma.PrismaPromise<GetUserAggregateType<T>>

    /**
     * Group by User.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends UserGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: UserGroupByArgs['orderBy'] }
        : { orderBy?: UserGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, UserGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetUserGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the User model
   */
  readonly fields: UserFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for User.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__UserClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    absensi<T extends User$absensiArgs<ExtArgs> = {}>(args?: Subset<T, User$absensiArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AbsensiPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    shift<T extends User$shiftArgs<ExtArgs> = {}>(args?: Subset<T, User$shiftArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ShiftPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    shiftRequestsPengaju<T extends User$shiftRequestsPengajuArgs<ExtArgs> = {}>(args?: Subset<T, User$shiftRequestsPengajuArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ShiftSwapRequestPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    shiftRequestsTarget<T extends User$shiftRequestsTargetArgs<ExtArgs> = {}>(args?: Subset<T, User$shiftRequestsTargetArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ShiftSwapRequestPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the User model
   */
  interface UserFieldRefs {
    readonly id: FieldRef<"User", 'Int'>
    readonly nama: FieldRef<"User", 'String'>
    readonly email: FieldRef<"User", 'String'>
    readonly password: FieldRef<"User", 'String'>
    readonly role: FieldRef<"User", 'Role'>
    readonly nomorHP: FieldRef<"User", 'String'>
    readonly idPegawai: FieldRef<"User", 'String'>
    readonly unitKerja: FieldRef<"User", 'String'>
    readonly createdAt: FieldRef<"User", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * User findUnique
   */
  export type UserFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User findUniqueOrThrow
   */
  export type UserFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User findFirst
   */
  export type UserFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Users.
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Users.
     */
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * User findFirstOrThrow
   */
  export type UserFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Users.
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Users.
     */
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * User findMany
   */
  export type UserFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which Users to fetch.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Users.
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * User create
   */
  export type UserCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * The data needed to create a User.
     */
    data: XOR<UserCreateInput, UserUncheckedCreateInput>
  }

  /**
   * User createMany
   */
  export type UserCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Users.
     */
    data: UserCreateManyInput | UserCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * User createManyAndReturn
   */
  export type UserCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * The data used to create many Users.
     */
    data: UserCreateManyInput | UserCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * User update
   */
  export type UserUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * The data needed to update a User.
     */
    data: XOR<UserUpdateInput, UserUncheckedUpdateInput>
    /**
     * Choose, which User to update.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User updateMany
   */
  export type UserUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Users.
     */
    data: XOR<UserUpdateManyMutationInput, UserUncheckedUpdateManyInput>
    /**
     * Filter which Users to update
     */
    where?: UserWhereInput
    /**
     * Limit how many Users to update.
     */
    limit?: number
  }

  /**
   * User updateManyAndReturn
   */
  export type UserUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * The data used to update Users.
     */
    data: XOR<UserUpdateManyMutationInput, UserUncheckedUpdateManyInput>
    /**
     * Filter which Users to update
     */
    where?: UserWhereInput
    /**
     * Limit how many Users to update.
     */
    limit?: number
  }

  /**
   * User upsert
   */
  export type UserUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * The filter to search for the User to update in case it exists.
     */
    where: UserWhereUniqueInput
    /**
     * In case the User found by the `where` argument doesn't exist, create a new User with this data.
     */
    create: XOR<UserCreateInput, UserUncheckedCreateInput>
    /**
     * In case the User was found with the provided `where` argument, update it with this data.
     */
    update: XOR<UserUpdateInput, UserUncheckedUpdateInput>
  }

  /**
   * User delete
   */
  export type UserDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter which User to delete.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User deleteMany
   */
  export type UserDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Users to delete
     */
    where?: UserWhereInput
    /**
     * Limit how many Users to delete.
     */
    limit?: number
  }

  /**
   * User.absensi
   */
  export type User$absensiArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Absensi
     */
    select?: AbsensiSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Absensi
     */
    omit?: AbsensiOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AbsensiInclude<ExtArgs> | null
    where?: AbsensiWhereInput
    orderBy?: AbsensiOrderByWithRelationInput | AbsensiOrderByWithRelationInput[]
    cursor?: AbsensiWhereUniqueInput
    take?: number
    skip?: number
    distinct?: AbsensiScalarFieldEnum | AbsensiScalarFieldEnum[]
  }

  /**
   * User.shift
   */
  export type User$shiftArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Shift
     */
    select?: ShiftSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Shift
     */
    omit?: ShiftOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ShiftInclude<ExtArgs> | null
    where?: ShiftWhereInput
    orderBy?: ShiftOrderByWithRelationInput | ShiftOrderByWithRelationInput[]
    cursor?: ShiftWhereUniqueInput
    take?: number
    skip?: number
    distinct?: ShiftScalarFieldEnum | ShiftScalarFieldEnum[]
  }

  /**
   * User.shiftRequestsPengaju
   */
  export type User$shiftRequestsPengajuArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ShiftSwapRequest
     */
    select?: ShiftSwapRequestSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ShiftSwapRequest
     */
    omit?: ShiftSwapRequestOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ShiftSwapRequestInclude<ExtArgs> | null
    where?: ShiftSwapRequestWhereInput
    orderBy?: ShiftSwapRequestOrderByWithRelationInput | ShiftSwapRequestOrderByWithRelationInput[]
    cursor?: ShiftSwapRequestWhereUniqueInput
    take?: number
    skip?: number
    distinct?: ShiftSwapRequestScalarFieldEnum | ShiftSwapRequestScalarFieldEnum[]
  }

  /**
   * User.shiftRequestsTarget
   */
  export type User$shiftRequestsTargetArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ShiftSwapRequest
     */
    select?: ShiftSwapRequestSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ShiftSwapRequest
     */
    omit?: ShiftSwapRequestOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ShiftSwapRequestInclude<ExtArgs> | null
    where?: ShiftSwapRequestWhereInput
    orderBy?: ShiftSwapRequestOrderByWithRelationInput | ShiftSwapRequestOrderByWithRelationInput[]
    cursor?: ShiftSwapRequestWhereUniqueInput
    take?: number
    skip?: number
    distinct?: ShiftSwapRequestScalarFieldEnum | ShiftSwapRequestScalarFieldEnum[]
  }

  /**
   * User without action
   */
  export type UserDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
  }


  /**
   * Model Shift
   */

  export type AggregateShift = {
    _count: ShiftCountAggregateOutputType | null
    _avg: ShiftAvgAggregateOutputType | null
    _sum: ShiftSumAggregateOutputType | null
    _min: ShiftMinAggregateOutputType | null
    _max: ShiftMaxAggregateOutputType | null
  }

  export type ShiftAvgAggregateOutputType = {
    id: number | null
    userId: number | null
  }

  export type ShiftSumAggregateOutputType = {
    id: number | null
    userId: number | null
  }

  export type ShiftMinAggregateOutputType = {
    id: number | null
    tanggal: Date | null
    jamMulai: string | null
    jamSelesai: string | null
    lokasiShift: string | null
    userId: number | null
    createdAt: Date | null
  }

  export type ShiftMaxAggregateOutputType = {
    id: number | null
    tanggal: Date | null
    jamMulai: string | null
    jamSelesai: string | null
    lokasiShift: string | null
    userId: number | null
    createdAt: Date | null
  }

  export type ShiftCountAggregateOutputType = {
    id: number
    tanggal: number
    jamMulai: number
    jamSelesai: number
    lokasiShift: number
    userId: number
    createdAt: number
    _all: number
  }


  export type ShiftAvgAggregateInputType = {
    id?: true
    userId?: true
  }

  export type ShiftSumAggregateInputType = {
    id?: true
    userId?: true
  }

  export type ShiftMinAggregateInputType = {
    id?: true
    tanggal?: true
    jamMulai?: true
    jamSelesai?: true
    lokasiShift?: true
    userId?: true
    createdAt?: true
  }

  export type ShiftMaxAggregateInputType = {
    id?: true
    tanggal?: true
    jamMulai?: true
    jamSelesai?: true
    lokasiShift?: true
    userId?: true
    createdAt?: true
  }

  export type ShiftCountAggregateInputType = {
    id?: true
    tanggal?: true
    jamMulai?: true
    jamSelesai?: true
    lokasiShift?: true
    userId?: true
    createdAt?: true
    _all?: true
  }

  export type ShiftAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Shift to aggregate.
     */
    where?: ShiftWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Shifts to fetch.
     */
    orderBy?: ShiftOrderByWithRelationInput | ShiftOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: ShiftWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Shifts from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Shifts.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Shifts
    **/
    _count?: true | ShiftCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: ShiftAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: ShiftSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: ShiftMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: ShiftMaxAggregateInputType
  }

  export type GetShiftAggregateType<T extends ShiftAggregateArgs> = {
        [P in keyof T & keyof AggregateShift]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateShift[P]>
      : GetScalarType<T[P], AggregateShift[P]>
  }




  export type ShiftGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ShiftWhereInput
    orderBy?: ShiftOrderByWithAggregationInput | ShiftOrderByWithAggregationInput[]
    by: ShiftScalarFieldEnum[] | ShiftScalarFieldEnum
    having?: ShiftScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: ShiftCountAggregateInputType | true
    _avg?: ShiftAvgAggregateInputType
    _sum?: ShiftSumAggregateInputType
    _min?: ShiftMinAggregateInputType
    _max?: ShiftMaxAggregateInputType
  }

  export type ShiftGroupByOutputType = {
    id: number
    tanggal: Date
    jamMulai: string
    jamSelesai: string
    lokasiShift: string
    userId: number
    createdAt: Date
    _count: ShiftCountAggregateOutputType | null
    _avg: ShiftAvgAggregateOutputType | null
    _sum: ShiftSumAggregateOutputType | null
    _min: ShiftMinAggregateOutputType | null
    _max: ShiftMaxAggregateOutputType | null
  }

  type GetShiftGroupByPayload<T extends ShiftGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<ShiftGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof ShiftGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], ShiftGroupByOutputType[P]>
            : GetScalarType<T[P], ShiftGroupByOutputType[P]>
        }
      >
    >


  export type ShiftSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tanggal?: boolean
    jamMulai?: boolean
    jamSelesai?: boolean
    lokasiShift?: boolean
    userId?: boolean
    createdAt?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
    swapRequests?: boolean | Shift$swapRequestsArgs<ExtArgs>
    _count?: boolean | ShiftCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["shift"]>

  export type ShiftSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tanggal?: boolean
    jamMulai?: boolean
    jamSelesai?: boolean
    lokasiShift?: boolean
    userId?: boolean
    createdAt?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["shift"]>

  export type ShiftSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tanggal?: boolean
    jamMulai?: boolean
    jamSelesai?: boolean
    lokasiShift?: boolean
    userId?: boolean
    createdAt?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["shift"]>

  export type ShiftSelectScalar = {
    id?: boolean
    tanggal?: boolean
    jamMulai?: boolean
    jamSelesai?: boolean
    lokasiShift?: boolean
    userId?: boolean
    createdAt?: boolean
  }

  export type ShiftOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "tanggal" | "jamMulai" | "jamSelesai" | "lokasiShift" | "userId" | "createdAt", ExtArgs["result"]["shift"]>
  export type ShiftInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
    swapRequests?: boolean | Shift$swapRequestsArgs<ExtArgs>
    _count?: boolean | ShiftCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type ShiftIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }
  export type ShiftIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }

  export type $ShiftPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Shift"
    objects: {
      user: Prisma.$UserPayload<ExtArgs>
      swapRequests: Prisma.$ShiftSwapRequestPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: number
      tanggal: Date
      jamMulai: string
      jamSelesai: string
      lokasiShift: string
      userId: number
      createdAt: Date
    }, ExtArgs["result"]["shift"]>
    composites: {}
  }

  type ShiftGetPayload<S extends boolean | null | undefined | ShiftDefaultArgs> = $Result.GetResult<Prisma.$ShiftPayload, S>

  type ShiftCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<ShiftFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: ShiftCountAggregateInputType | true
    }

  export interface ShiftDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Shift'], meta: { name: 'Shift' } }
    /**
     * Find zero or one Shift that matches the filter.
     * @param {ShiftFindUniqueArgs} args - Arguments to find a Shift
     * @example
     * // Get one Shift
     * const shift = await prisma.shift.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ShiftFindUniqueArgs>(args: SelectSubset<T, ShiftFindUniqueArgs<ExtArgs>>): Prisma__ShiftClient<$Result.GetResult<Prisma.$ShiftPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Shift that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {ShiftFindUniqueOrThrowArgs} args - Arguments to find a Shift
     * @example
     * // Get one Shift
     * const shift = await prisma.shift.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ShiftFindUniqueOrThrowArgs>(args: SelectSubset<T, ShiftFindUniqueOrThrowArgs<ExtArgs>>): Prisma__ShiftClient<$Result.GetResult<Prisma.$ShiftPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Shift that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ShiftFindFirstArgs} args - Arguments to find a Shift
     * @example
     * // Get one Shift
     * const shift = await prisma.shift.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ShiftFindFirstArgs>(args?: SelectSubset<T, ShiftFindFirstArgs<ExtArgs>>): Prisma__ShiftClient<$Result.GetResult<Prisma.$ShiftPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Shift that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ShiftFindFirstOrThrowArgs} args - Arguments to find a Shift
     * @example
     * // Get one Shift
     * const shift = await prisma.shift.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ShiftFindFirstOrThrowArgs>(args?: SelectSubset<T, ShiftFindFirstOrThrowArgs<ExtArgs>>): Prisma__ShiftClient<$Result.GetResult<Prisma.$ShiftPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Shifts that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ShiftFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Shifts
     * const shifts = await prisma.shift.findMany()
     * 
     * // Get first 10 Shifts
     * const shifts = await prisma.shift.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const shiftWithIdOnly = await prisma.shift.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends ShiftFindManyArgs>(args?: SelectSubset<T, ShiftFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ShiftPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Shift.
     * @param {ShiftCreateArgs} args - Arguments to create a Shift.
     * @example
     * // Create one Shift
     * const Shift = await prisma.shift.create({
     *   data: {
     *     // ... data to create a Shift
     *   }
     * })
     * 
     */
    create<T extends ShiftCreateArgs>(args: SelectSubset<T, ShiftCreateArgs<ExtArgs>>): Prisma__ShiftClient<$Result.GetResult<Prisma.$ShiftPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Shifts.
     * @param {ShiftCreateManyArgs} args - Arguments to create many Shifts.
     * @example
     * // Create many Shifts
     * const shift = await prisma.shift.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends ShiftCreateManyArgs>(args?: SelectSubset<T, ShiftCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Shifts and returns the data saved in the database.
     * @param {ShiftCreateManyAndReturnArgs} args - Arguments to create many Shifts.
     * @example
     * // Create many Shifts
     * const shift = await prisma.shift.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Shifts and only return the `id`
     * const shiftWithIdOnly = await prisma.shift.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends ShiftCreateManyAndReturnArgs>(args?: SelectSubset<T, ShiftCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ShiftPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Shift.
     * @param {ShiftDeleteArgs} args - Arguments to delete one Shift.
     * @example
     * // Delete one Shift
     * const Shift = await prisma.shift.delete({
     *   where: {
     *     // ... filter to delete one Shift
     *   }
     * })
     * 
     */
    delete<T extends ShiftDeleteArgs>(args: SelectSubset<T, ShiftDeleteArgs<ExtArgs>>): Prisma__ShiftClient<$Result.GetResult<Prisma.$ShiftPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Shift.
     * @param {ShiftUpdateArgs} args - Arguments to update one Shift.
     * @example
     * // Update one Shift
     * const shift = await prisma.shift.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends ShiftUpdateArgs>(args: SelectSubset<T, ShiftUpdateArgs<ExtArgs>>): Prisma__ShiftClient<$Result.GetResult<Prisma.$ShiftPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Shifts.
     * @param {ShiftDeleteManyArgs} args - Arguments to filter Shifts to delete.
     * @example
     * // Delete a few Shifts
     * const { count } = await prisma.shift.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends ShiftDeleteManyArgs>(args?: SelectSubset<T, ShiftDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Shifts.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ShiftUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Shifts
     * const shift = await prisma.shift.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends ShiftUpdateManyArgs>(args: SelectSubset<T, ShiftUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Shifts and returns the data updated in the database.
     * @param {ShiftUpdateManyAndReturnArgs} args - Arguments to update many Shifts.
     * @example
     * // Update many Shifts
     * const shift = await prisma.shift.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Shifts and only return the `id`
     * const shiftWithIdOnly = await prisma.shift.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends ShiftUpdateManyAndReturnArgs>(args: SelectSubset<T, ShiftUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ShiftPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Shift.
     * @param {ShiftUpsertArgs} args - Arguments to update or create a Shift.
     * @example
     * // Update or create a Shift
     * const shift = await prisma.shift.upsert({
     *   create: {
     *     // ... data to create a Shift
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Shift we want to update
     *   }
     * })
     */
    upsert<T extends ShiftUpsertArgs>(args: SelectSubset<T, ShiftUpsertArgs<ExtArgs>>): Prisma__ShiftClient<$Result.GetResult<Prisma.$ShiftPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Shifts.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ShiftCountArgs} args - Arguments to filter Shifts to count.
     * @example
     * // Count the number of Shifts
     * const count = await prisma.shift.count({
     *   where: {
     *     // ... the filter for the Shifts we want to count
     *   }
     * })
    **/
    count<T extends ShiftCountArgs>(
      args?: Subset<T, ShiftCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], ShiftCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Shift.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ShiftAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends ShiftAggregateArgs>(args: Subset<T, ShiftAggregateArgs>): Prisma.PrismaPromise<GetShiftAggregateType<T>>

    /**
     * Group by Shift.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ShiftGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends ShiftGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ShiftGroupByArgs['orderBy'] }
        : { orderBy?: ShiftGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, ShiftGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetShiftGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Shift model
   */
  readonly fields: ShiftFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Shift.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ShiftClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    user<T extends UserDefaultArgs<ExtArgs> = {}>(args?: Subset<T, UserDefaultArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    swapRequests<T extends Shift$swapRequestsArgs<ExtArgs> = {}>(args?: Subset<T, Shift$swapRequestsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ShiftSwapRequestPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Shift model
   */
  interface ShiftFieldRefs {
    readonly id: FieldRef<"Shift", 'Int'>
    readonly tanggal: FieldRef<"Shift", 'DateTime'>
    readonly jamMulai: FieldRef<"Shift", 'String'>
    readonly jamSelesai: FieldRef<"Shift", 'String'>
    readonly lokasiShift: FieldRef<"Shift", 'String'>
    readonly userId: FieldRef<"Shift", 'Int'>
    readonly createdAt: FieldRef<"Shift", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Shift findUnique
   */
  export type ShiftFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Shift
     */
    select?: ShiftSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Shift
     */
    omit?: ShiftOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ShiftInclude<ExtArgs> | null
    /**
     * Filter, which Shift to fetch.
     */
    where: ShiftWhereUniqueInput
  }

  /**
   * Shift findUniqueOrThrow
   */
  export type ShiftFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Shift
     */
    select?: ShiftSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Shift
     */
    omit?: ShiftOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ShiftInclude<ExtArgs> | null
    /**
     * Filter, which Shift to fetch.
     */
    where: ShiftWhereUniqueInput
  }

  /**
   * Shift findFirst
   */
  export type ShiftFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Shift
     */
    select?: ShiftSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Shift
     */
    omit?: ShiftOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ShiftInclude<ExtArgs> | null
    /**
     * Filter, which Shift to fetch.
     */
    where?: ShiftWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Shifts to fetch.
     */
    orderBy?: ShiftOrderByWithRelationInput | ShiftOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Shifts.
     */
    cursor?: ShiftWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Shifts from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Shifts.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Shifts.
     */
    distinct?: ShiftScalarFieldEnum | ShiftScalarFieldEnum[]
  }

  /**
   * Shift findFirstOrThrow
   */
  export type ShiftFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Shift
     */
    select?: ShiftSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Shift
     */
    omit?: ShiftOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ShiftInclude<ExtArgs> | null
    /**
     * Filter, which Shift to fetch.
     */
    where?: ShiftWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Shifts to fetch.
     */
    orderBy?: ShiftOrderByWithRelationInput | ShiftOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Shifts.
     */
    cursor?: ShiftWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Shifts from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Shifts.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Shifts.
     */
    distinct?: ShiftScalarFieldEnum | ShiftScalarFieldEnum[]
  }

  /**
   * Shift findMany
   */
  export type ShiftFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Shift
     */
    select?: ShiftSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Shift
     */
    omit?: ShiftOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ShiftInclude<ExtArgs> | null
    /**
     * Filter, which Shifts to fetch.
     */
    where?: ShiftWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Shifts to fetch.
     */
    orderBy?: ShiftOrderByWithRelationInput | ShiftOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Shifts.
     */
    cursor?: ShiftWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Shifts from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Shifts.
     */
    skip?: number
    distinct?: ShiftScalarFieldEnum | ShiftScalarFieldEnum[]
  }

  /**
   * Shift create
   */
  export type ShiftCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Shift
     */
    select?: ShiftSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Shift
     */
    omit?: ShiftOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ShiftInclude<ExtArgs> | null
    /**
     * The data needed to create a Shift.
     */
    data: XOR<ShiftCreateInput, ShiftUncheckedCreateInput>
  }

  /**
   * Shift createMany
   */
  export type ShiftCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Shifts.
     */
    data: ShiftCreateManyInput | ShiftCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Shift createManyAndReturn
   */
  export type ShiftCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Shift
     */
    select?: ShiftSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Shift
     */
    omit?: ShiftOmit<ExtArgs> | null
    /**
     * The data used to create many Shifts.
     */
    data: ShiftCreateManyInput | ShiftCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ShiftIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Shift update
   */
  export type ShiftUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Shift
     */
    select?: ShiftSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Shift
     */
    omit?: ShiftOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ShiftInclude<ExtArgs> | null
    /**
     * The data needed to update a Shift.
     */
    data: XOR<ShiftUpdateInput, ShiftUncheckedUpdateInput>
    /**
     * Choose, which Shift to update.
     */
    where: ShiftWhereUniqueInput
  }

  /**
   * Shift updateMany
   */
  export type ShiftUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Shifts.
     */
    data: XOR<ShiftUpdateManyMutationInput, ShiftUncheckedUpdateManyInput>
    /**
     * Filter which Shifts to update
     */
    where?: ShiftWhereInput
    /**
     * Limit how many Shifts to update.
     */
    limit?: number
  }

  /**
   * Shift updateManyAndReturn
   */
  export type ShiftUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Shift
     */
    select?: ShiftSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Shift
     */
    omit?: ShiftOmit<ExtArgs> | null
    /**
     * The data used to update Shifts.
     */
    data: XOR<ShiftUpdateManyMutationInput, ShiftUncheckedUpdateManyInput>
    /**
     * Filter which Shifts to update
     */
    where?: ShiftWhereInput
    /**
     * Limit how many Shifts to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ShiftIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * Shift upsert
   */
  export type ShiftUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Shift
     */
    select?: ShiftSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Shift
     */
    omit?: ShiftOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ShiftInclude<ExtArgs> | null
    /**
     * The filter to search for the Shift to update in case it exists.
     */
    where: ShiftWhereUniqueInput
    /**
     * In case the Shift found by the `where` argument doesn't exist, create a new Shift with this data.
     */
    create: XOR<ShiftCreateInput, ShiftUncheckedCreateInput>
    /**
     * In case the Shift was found with the provided `where` argument, update it with this data.
     */
    update: XOR<ShiftUpdateInput, ShiftUncheckedUpdateInput>
  }

  /**
   * Shift delete
   */
  export type ShiftDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Shift
     */
    select?: ShiftSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Shift
     */
    omit?: ShiftOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ShiftInclude<ExtArgs> | null
    /**
     * Filter which Shift to delete.
     */
    where: ShiftWhereUniqueInput
  }

  /**
   * Shift deleteMany
   */
  export type ShiftDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Shifts to delete
     */
    where?: ShiftWhereInput
    /**
     * Limit how many Shifts to delete.
     */
    limit?: number
  }

  /**
   * Shift.swapRequests
   */
  export type Shift$swapRequestsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ShiftSwapRequest
     */
    select?: ShiftSwapRequestSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ShiftSwapRequest
     */
    omit?: ShiftSwapRequestOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ShiftSwapRequestInclude<ExtArgs> | null
    where?: ShiftSwapRequestWhereInput
    orderBy?: ShiftSwapRequestOrderByWithRelationInput | ShiftSwapRequestOrderByWithRelationInput[]
    cursor?: ShiftSwapRequestWhereUniqueInput
    take?: number
    skip?: number
    distinct?: ShiftSwapRequestScalarFieldEnum | ShiftSwapRequestScalarFieldEnum[]
  }

  /**
   * Shift without action
   */
  export type ShiftDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Shift
     */
    select?: ShiftSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Shift
     */
    omit?: ShiftOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ShiftInclude<ExtArgs> | null
  }


  /**
   * Model Absensi
   */

  export type AggregateAbsensi = {
    _count: AbsensiCountAggregateOutputType | null
    _avg: AbsensiAvgAggregateOutputType | null
    _sum: AbsensiSumAggregateOutputType | null
    _min: AbsensiMinAggregateOutputType | null
    _max: AbsensiMaxAggregateOutputType | null
  }

  export type AbsensiAvgAggregateOutputType = {
    id: number | null
    userId: number | null
  }

  export type AbsensiSumAggregateOutputType = {
    id: number | null
    userId: number | null
  }

  export type AbsensiMinAggregateOutputType = {
    id: number | null
    tanggal: Date | null
    jamMasuk: string | null
    jamKeluar: string | null
    status: $Enums.AbsensiStatus | null
    userId: number | null
    createdAt: Date | null
  }

  export type AbsensiMaxAggregateOutputType = {
    id: number | null
    tanggal: Date | null
    jamMasuk: string | null
    jamKeluar: string | null
    status: $Enums.AbsensiStatus | null
    userId: number | null
    createdAt: Date | null
  }

  export type AbsensiCountAggregateOutputType = {
    id: number
    tanggal: number
    jamMasuk: number
    jamKeluar: number
    status: number
    userId: number
    createdAt: number
    _all: number
  }


  export type AbsensiAvgAggregateInputType = {
    id?: true
    userId?: true
  }

  export type AbsensiSumAggregateInputType = {
    id?: true
    userId?: true
  }

  export type AbsensiMinAggregateInputType = {
    id?: true
    tanggal?: true
    jamMasuk?: true
    jamKeluar?: true
    status?: true
    userId?: true
    createdAt?: true
  }

  export type AbsensiMaxAggregateInputType = {
    id?: true
    tanggal?: true
    jamMasuk?: true
    jamKeluar?: true
    status?: true
    userId?: true
    createdAt?: true
  }

  export type AbsensiCountAggregateInputType = {
    id?: true
    tanggal?: true
    jamMasuk?: true
    jamKeluar?: true
    status?: true
    userId?: true
    createdAt?: true
    _all?: true
  }

  export type AbsensiAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Absensi to aggregate.
     */
    where?: AbsensiWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Absensis to fetch.
     */
    orderBy?: AbsensiOrderByWithRelationInput | AbsensiOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: AbsensiWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Absensis from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Absensis.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Absensis
    **/
    _count?: true | AbsensiCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: AbsensiAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: AbsensiSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: AbsensiMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: AbsensiMaxAggregateInputType
  }

  export type GetAbsensiAggregateType<T extends AbsensiAggregateArgs> = {
        [P in keyof T & keyof AggregateAbsensi]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateAbsensi[P]>
      : GetScalarType<T[P], AggregateAbsensi[P]>
  }




  export type AbsensiGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: AbsensiWhereInput
    orderBy?: AbsensiOrderByWithAggregationInput | AbsensiOrderByWithAggregationInput[]
    by: AbsensiScalarFieldEnum[] | AbsensiScalarFieldEnum
    having?: AbsensiScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: AbsensiCountAggregateInputType | true
    _avg?: AbsensiAvgAggregateInputType
    _sum?: AbsensiSumAggregateInputType
    _min?: AbsensiMinAggregateInputType
    _max?: AbsensiMaxAggregateInputType
  }

  export type AbsensiGroupByOutputType = {
    id: number
    tanggal: Date
    jamMasuk: string | null
    jamKeluar: string | null
    status: $Enums.AbsensiStatus
    userId: number
    createdAt: Date
    _count: AbsensiCountAggregateOutputType | null
    _avg: AbsensiAvgAggregateOutputType | null
    _sum: AbsensiSumAggregateOutputType | null
    _min: AbsensiMinAggregateOutputType | null
    _max: AbsensiMaxAggregateOutputType | null
  }

  type GetAbsensiGroupByPayload<T extends AbsensiGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<AbsensiGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof AbsensiGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], AbsensiGroupByOutputType[P]>
            : GetScalarType<T[P], AbsensiGroupByOutputType[P]>
        }
      >
    >


  export type AbsensiSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tanggal?: boolean
    jamMasuk?: boolean
    jamKeluar?: boolean
    status?: boolean
    userId?: boolean
    createdAt?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["absensi"]>

  export type AbsensiSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tanggal?: boolean
    jamMasuk?: boolean
    jamKeluar?: boolean
    status?: boolean
    userId?: boolean
    createdAt?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["absensi"]>

  export type AbsensiSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tanggal?: boolean
    jamMasuk?: boolean
    jamKeluar?: boolean
    status?: boolean
    userId?: boolean
    createdAt?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["absensi"]>

  export type AbsensiSelectScalar = {
    id?: boolean
    tanggal?: boolean
    jamMasuk?: boolean
    jamKeluar?: boolean
    status?: boolean
    userId?: boolean
    createdAt?: boolean
  }

  export type AbsensiOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "tanggal" | "jamMasuk" | "jamKeluar" | "status" | "userId" | "createdAt", ExtArgs["result"]["absensi"]>
  export type AbsensiInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }
  export type AbsensiIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }
  export type AbsensiIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }

  export type $AbsensiPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Absensi"
    objects: {
      user: Prisma.$UserPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: number
      tanggal: Date
      jamMasuk: string | null
      jamKeluar: string | null
      status: $Enums.AbsensiStatus
      userId: number
      createdAt: Date
    }, ExtArgs["result"]["absensi"]>
    composites: {}
  }

  type AbsensiGetPayload<S extends boolean | null | undefined | AbsensiDefaultArgs> = $Result.GetResult<Prisma.$AbsensiPayload, S>

  type AbsensiCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<AbsensiFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: AbsensiCountAggregateInputType | true
    }

  export interface AbsensiDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Absensi'], meta: { name: 'Absensi' } }
    /**
     * Find zero or one Absensi that matches the filter.
     * @param {AbsensiFindUniqueArgs} args - Arguments to find a Absensi
     * @example
     * // Get one Absensi
     * const absensi = await prisma.absensi.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends AbsensiFindUniqueArgs>(args: SelectSubset<T, AbsensiFindUniqueArgs<ExtArgs>>): Prisma__AbsensiClient<$Result.GetResult<Prisma.$AbsensiPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Absensi that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {AbsensiFindUniqueOrThrowArgs} args - Arguments to find a Absensi
     * @example
     * // Get one Absensi
     * const absensi = await prisma.absensi.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends AbsensiFindUniqueOrThrowArgs>(args: SelectSubset<T, AbsensiFindUniqueOrThrowArgs<ExtArgs>>): Prisma__AbsensiClient<$Result.GetResult<Prisma.$AbsensiPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Absensi that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AbsensiFindFirstArgs} args - Arguments to find a Absensi
     * @example
     * // Get one Absensi
     * const absensi = await prisma.absensi.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends AbsensiFindFirstArgs>(args?: SelectSubset<T, AbsensiFindFirstArgs<ExtArgs>>): Prisma__AbsensiClient<$Result.GetResult<Prisma.$AbsensiPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Absensi that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AbsensiFindFirstOrThrowArgs} args - Arguments to find a Absensi
     * @example
     * // Get one Absensi
     * const absensi = await prisma.absensi.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends AbsensiFindFirstOrThrowArgs>(args?: SelectSubset<T, AbsensiFindFirstOrThrowArgs<ExtArgs>>): Prisma__AbsensiClient<$Result.GetResult<Prisma.$AbsensiPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Absensis that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AbsensiFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Absensis
     * const absensis = await prisma.absensi.findMany()
     * 
     * // Get first 10 Absensis
     * const absensis = await prisma.absensi.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const absensiWithIdOnly = await prisma.absensi.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends AbsensiFindManyArgs>(args?: SelectSubset<T, AbsensiFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AbsensiPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Absensi.
     * @param {AbsensiCreateArgs} args - Arguments to create a Absensi.
     * @example
     * // Create one Absensi
     * const Absensi = await prisma.absensi.create({
     *   data: {
     *     // ... data to create a Absensi
     *   }
     * })
     * 
     */
    create<T extends AbsensiCreateArgs>(args: SelectSubset<T, AbsensiCreateArgs<ExtArgs>>): Prisma__AbsensiClient<$Result.GetResult<Prisma.$AbsensiPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Absensis.
     * @param {AbsensiCreateManyArgs} args - Arguments to create many Absensis.
     * @example
     * // Create many Absensis
     * const absensi = await prisma.absensi.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends AbsensiCreateManyArgs>(args?: SelectSubset<T, AbsensiCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Absensis and returns the data saved in the database.
     * @param {AbsensiCreateManyAndReturnArgs} args - Arguments to create many Absensis.
     * @example
     * // Create many Absensis
     * const absensi = await prisma.absensi.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Absensis and only return the `id`
     * const absensiWithIdOnly = await prisma.absensi.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends AbsensiCreateManyAndReturnArgs>(args?: SelectSubset<T, AbsensiCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AbsensiPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Absensi.
     * @param {AbsensiDeleteArgs} args - Arguments to delete one Absensi.
     * @example
     * // Delete one Absensi
     * const Absensi = await prisma.absensi.delete({
     *   where: {
     *     // ... filter to delete one Absensi
     *   }
     * })
     * 
     */
    delete<T extends AbsensiDeleteArgs>(args: SelectSubset<T, AbsensiDeleteArgs<ExtArgs>>): Prisma__AbsensiClient<$Result.GetResult<Prisma.$AbsensiPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Absensi.
     * @param {AbsensiUpdateArgs} args - Arguments to update one Absensi.
     * @example
     * // Update one Absensi
     * const absensi = await prisma.absensi.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends AbsensiUpdateArgs>(args: SelectSubset<T, AbsensiUpdateArgs<ExtArgs>>): Prisma__AbsensiClient<$Result.GetResult<Prisma.$AbsensiPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Absensis.
     * @param {AbsensiDeleteManyArgs} args - Arguments to filter Absensis to delete.
     * @example
     * // Delete a few Absensis
     * const { count } = await prisma.absensi.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends AbsensiDeleteManyArgs>(args?: SelectSubset<T, AbsensiDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Absensis.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AbsensiUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Absensis
     * const absensi = await prisma.absensi.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends AbsensiUpdateManyArgs>(args: SelectSubset<T, AbsensiUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Absensis and returns the data updated in the database.
     * @param {AbsensiUpdateManyAndReturnArgs} args - Arguments to update many Absensis.
     * @example
     * // Update many Absensis
     * const absensi = await prisma.absensi.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Absensis and only return the `id`
     * const absensiWithIdOnly = await prisma.absensi.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends AbsensiUpdateManyAndReturnArgs>(args: SelectSubset<T, AbsensiUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AbsensiPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Absensi.
     * @param {AbsensiUpsertArgs} args - Arguments to update or create a Absensi.
     * @example
     * // Update or create a Absensi
     * const absensi = await prisma.absensi.upsert({
     *   create: {
     *     // ... data to create a Absensi
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Absensi we want to update
     *   }
     * })
     */
    upsert<T extends AbsensiUpsertArgs>(args: SelectSubset<T, AbsensiUpsertArgs<ExtArgs>>): Prisma__AbsensiClient<$Result.GetResult<Prisma.$AbsensiPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Absensis.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AbsensiCountArgs} args - Arguments to filter Absensis to count.
     * @example
     * // Count the number of Absensis
     * const count = await prisma.absensi.count({
     *   where: {
     *     // ... the filter for the Absensis we want to count
     *   }
     * })
    **/
    count<T extends AbsensiCountArgs>(
      args?: Subset<T, AbsensiCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], AbsensiCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Absensi.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AbsensiAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends AbsensiAggregateArgs>(args: Subset<T, AbsensiAggregateArgs>): Prisma.PrismaPromise<GetAbsensiAggregateType<T>>

    /**
     * Group by Absensi.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AbsensiGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends AbsensiGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: AbsensiGroupByArgs['orderBy'] }
        : { orderBy?: AbsensiGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, AbsensiGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetAbsensiGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Absensi model
   */
  readonly fields: AbsensiFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Absensi.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__AbsensiClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    user<T extends UserDefaultArgs<ExtArgs> = {}>(args?: Subset<T, UserDefaultArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Absensi model
   */
  interface AbsensiFieldRefs {
    readonly id: FieldRef<"Absensi", 'Int'>
    readonly tanggal: FieldRef<"Absensi", 'DateTime'>
    readonly jamMasuk: FieldRef<"Absensi", 'String'>
    readonly jamKeluar: FieldRef<"Absensi", 'String'>
    readonly status: FieldRef<"Absensi", 'AbsensiStatus'>
    readonly userId: FieldRef<"Absensi", 'Int'>
    readonly createdAt: FieldRef<"Absensi", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Absensi findUnique
   */
  export type AbsensiFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Absensi
     */
    select?: AbsensiSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Absensi
     */
    omit?: AbsensiOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AbsensiInclude<ExtArgs> | null
    /**
     * Filter, which Absensi to fetch.
     */
    where: AbsensiWhereUniqueInput
  }

  /**
   * Absensi findUniqueOrThrow
   */
  export type AbsensiFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Absensi
     */
    select?: AbsensiSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Absensi
     */
    omit?: AbsensiOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AbsensiInclude<ExtArgs> | null
    /**
     * Filter, which Absensi to fetch.
     */
    where: AbsensiWhereUniqueInput
  }

  /**
   * Absensi findFirst
   */
  export type AbsensiFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Absensi
     */
    select?: AbsensiSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Absensi
     */
    omit?: AbsensiOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AbsensiInclude<ExtArgs> | null
    /**
     * Filter, which Absensi to fetch.
     */
    where?: AbsensiWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Absensis to fetch.
     */
    orderBy?: AbsensiOrderByWithRelationInput | AbsensiOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Absensis.
     */
    cursor?: AbsensiWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Absensis from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Absensis.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Absensis.
     */
    distinct?: AbsensiScalarFieldEnum | AbsensiScalarFieldEnum[]
  }

  /**
   * Absensi findFirstOrThrow
   */
  export type AbsensiFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Absensi
     */
    select?: AbsensiSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Absensi
     */
    omit?: AbsensiOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AbsensiInclude<ExtArgs> | null
    /**
     * Filter, which Absensi to fetch.
     */
    where?: AbsensiWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Absensis to fetch.
     */
    orderBy?: AbsensiOrderByWithRelationInput | AbsensiOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Absensis.
     */
    cursor?: AbsensiWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Absensis from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Absensis.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Absensis.
     */
    distinct?: AbsensiScalarFieldEnum | AbsensiScalarFieldEnum[]
  }

  /**
   * Absensi findMany
   */
  export type AbsensiFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Absensi
     */
    select?: AbsensiSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Absensi
     */
    omit?: AbsensiOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AbsensiInclude<ExtArgs> | null
    /**
     * Filter, which Absensis to fetch.
     */
    where?: AbsensiWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Absensis to fetch.
     */
    orderBy?: AbsensiOrderByWithRelationInput | AbsensiOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Absensis.
     */
    cursor?: AbsensiWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Absensis from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Absensis.
     */
    skip?: number
    distinct?: AbsensiScalarFieldEnum | AbsensiScalarFieldEnum[]
  }

  /**
   * Absensi create
   */
  export type AbsensiCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Absensi
     */
    select?: AbsensiSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Absensi
     */
    omit?: AbsensiOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AbsensiInclude<ExtArgs> | null
    /**
     * The data needed to create a Absensi.
     */
    data: XOR<AbsensiCreateInput, AbsensiUncheckedCreateInput>
  }

  /**
   * Absensi createMany
   */
  export type AbsensiCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Absensis.
     */
    data: AbsensiCreateManyInput | AbsensiCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Absensi createManyAndReturn
   */
  export type AbsensiCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Absensi
     */
    select?: AbsensiSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Absensi
     */
    omit?: AbsensiOmit<ExtArgs> | null
    /**
     * The data used to create many Absensis.
     */
    data: AbsensiCreateManyInput | AbsensiCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AbsensiIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Absensi update
   */
  export type AbsensiUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Absensi
     */
    select?: AbsensiSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Absensi
     */
    omit?: AbsensiOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AbsensiInclude<ExtArgs> | null
    /**
     * The data needed to update a Absensi.
     */
    data: XOR<AbsensiUpdateInput, AbsensiUncheckedUpdateInput>
    /**
     * Choose, which Absensi to update.
     */
    where: AbsensiWhereUniqueInput
  }

  /**
   * Absensi updateMany
   */
  export type AbsensiUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Absensis.
     */
    data: XOR<AbsensiUpdateManyMutationInput, AbsensiUncheckedUpdateManyInput>
    /**
     * Filter which Absensis to update
     */
    where?: AbsensiWhereInput
    /**
     * Limit how many Absensis to update.
     */
    limit?: number
  }

  /**
   * Absensi updateManyAndReturn
   */
  export type AbsensiUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Absensi
     */
    select?: AbsensiSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Absensi
     */
    omit?: AbsensiOmit<ExtArgs> | null
    /**
     * The data used to update Absensis.
     */
    data: XOR<AbsensiUpdateManyMutationInput, AbsensiUncheckedUpdateManyInput>
    /**
     * Filter which Absensis to update
     */
    where?: AbsensiWhereInput
    /**
     * Limit how many Absensis to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AbsensiIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * Absensi upsert
   */
  export type AbsensiUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Absensi
     */
    select?: AbsensiSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Absensi
     */
    omit?: AbsensiOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AbsensiInclude<ExtArgs> | null
    /**
     * The filter to search for the Absensi to update in case it exists.
     */
    where: AbsensiWhereUniqueInput
    /**
     * In case the Absensi found by the `where` argument doesn't exist, create a new Absensi with this data.
     */
    create: XOR<AbsensiCreateInput, AbsensiUncheckedCreateInput>
    /**
     * In case the Absensi was found with the provided `where` argument, update it with this data.
     */
    update: XOR<AbsensiUpdateInput, AbsensiUncheckedUpdateInput>
  }

  /**
   * Absensi delete
   */
  export type AbsensiDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Absensi
     */
    select?: AbsensiSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Absensi
     */
    omit?: AbsensiOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AbsensiInclude<ExtArgs> | null
    /**
     * Filter which Absensi to delete.
     */
    where: AbsensiWhereUniqueInput
  }

  /**
   * Absensi deleteMany
   */
  export type AbsensiDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Absensis to delete
     */
    where?: AbsensiWhereInput
    /**
     * Limit how many Absensis to delete.
     */
    limit?: number
  }

  /**
   * Absensi without action
   */
  export type AbsensiDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Absensi
     */
    select?: AbsensiSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Absensi
     */
    omit?: AbsensiOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AbsensiInclude<ExtArgs> | null
  }


  /**
   * Model ShiftSwapRequest
   */

  export type AggregateShiftSwapRequest = {
    _count: ShiftSwapRequestCountAggregateOutputType | null
    _avg: ShiftSwapRequestAvgAggregateOutputType | null
    _sum: ShiftSwapRequestSumAggregateOutputType | null
    _min: ShiftSwapRequestMinAggregateOutputType | null
    _max: ShiftSwapRequestMaxAggregateOutputType | null
  }

  export type ShiftSwapRequestAvgAggregateOutputType = {
    id: number | null
    pengajuId: number | null
    targetUserId: number | null
    shiftId: number | null
  }

  export type ShiftSwapRequestSumAggregateOutputType = {
    id: number | null
    pengajuId: number | null
    targetUserId: number | null
    shiftId: number | null
  }

  export type ShiftSwapRequestMinAggregateOutputType = {
    id: number | null
    pengajuId: number | null
    targetUserId: number | null
    shiftId: number | null
    status: $Enums.SwapStatus | null
    createdAt: Date | null
  }

  export type ShiftSwapRequestMaxAggregateOutputType = {
    id: number | null
    pengajuId: number | null
    targetUserId: number | null
    shiftId: number | null
    status: $Enums.SwapStatus | null
    createdAt: Date | null
  }

  export type ShiftSwapRequestCountAggregateOutputType = {
    id: number
    pengajuId: number
    targetUserId: number
    shiftId: number
    status: number
    createdAt: number
    _all: number
  }


  export type ShiftSwapRequestAvgAggregateInputType = {
    id?: true
    pengajuId?: true
    targetUserId?: true
    shiftId?: true
  }

  export type ShiftSwapRequestSumAggregateInputType = {
    id?: true
    pengajuId?: true
    targetUserId?: true
    shiftId?: true
  }

  export type ShiftSwapRequestMinAggregateInputType = {
    id?: true
    pengajuId?: true
    targetUserId?: true
    shiftId?: true
    status?: true
    createdAt?: true
  }

  export type ShiftSwapRequestMaxAggregateInputType = {
    id?: true
    pengajuId?: true
    targetUserId?: true
    shiftId?: true
    status?: true
    createdAt?: true
  }

  export type ShiftSwapRequestCountAggregateInputType = {
    id?: true
    pengajuId?: true
    targetUserId?: true
    shiftId?: true
    status?: true
    createdAt?: true
    _all?: true
  }

  export type ShiftSwapRequestAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ShiftSwapRequest to aggregate.
     */
    where?: ShiftSwapRequestWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ShiftSwapRequests to fetch.
     */
    orderBy?: ShiftSwapRequestOrderByWithRelationInput | ShiftSwapRequestOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: ShiftSwapRequestWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ShiftSwapRequests from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ShiftSwapRequests.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned ShiftSwapRequests
    **/
    _count?: true | ShiftSwapRequestCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: ShiftSwapRequestAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: ShiftSwapRequestSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: ShiftSwapRequestMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: ShiftSwapRequestMaxAggregateInputType
  }

  export type GetShiftSwapRequestAggregateType<T extends ShiftSwapRequestAggregateArgs> = {
        [P in keyof T & keyof AggregateShiftSwapRequest]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateShiftSwapRequest[P]>
      : GetScalarType<T[P], AggregateShiftSwapRequest[P]>
  }




  export type ShiftSwapRequestGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ShiftSwapRequestWhereInput
    orderBy?: ShiftSwapRequestOrderByWithAggregationInput | ShiftSwapRequestOrderByWithAggregationInput[]
    by: ShiftSwapRequestScalarFieldEnum[] | ShiftSwapRequestScalarFieldEnum
    having?: ShiftSwapRequestScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: ShiftSwapRequestCountAggregateInputType | true
    _avg?: ShiftSwapRequestAvgAggregateInputType
    _sum?: ShiftSwapRequestSumAggregateInputType
    _min?: ShiftSwapRequestMinAggregateInputType
    _max?: ShiftSwapRequestMaxAggregateInputType
  }

  export type ShiftSwapRequestGroupByOutputType = {
    id: number
    pengajuId: number
    targetUserId: number
    shiftId: number
    status: $Enums.SwapStatus
    createdAt: Date
    _count: ShiftSwapRequestCountAggregateOutputType | null
    _avg: ShiftSwapRequestAvgAggregateOutputType | null
    _sum: ShiftSwapRequestSumAggregateOutputType | null
    _min: ShiftSwapRequestMinAggregateOutputType | null
    _max: ShiftSwapRequestMaxAggregateOutputType | null
  }

  type GetShiftSwapRequestGroupByPayload<T extends ShiftSwapRequestGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<ShiftSwapRequestGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof ShiftSwapRequestGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], ShiftSwapRequestGroupByOutputType[P]>
            : GetScalarType<T[P], ShiftSwapRequestGroupByOutputType[P]>
        }
      >
    >


  export type ShiftSwapRequestSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    pengajuId?: boolean
    targetUserId?: boolean
    shiftId?: boolean
    status?: boolean
    createdAt?: boolean
    pengaju?: boolean | UserDefaultArgs<ExtArgs>
    targetUser?: boolean | UserDefaultArgs<ExtArgs>
    shift?: boolean | ShiftDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["shiftSwapRequest"]>

  export type ShiftSwapRequestSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    pengajuId?: boolean
    targetUserId?: boolean
    shiftId?: boolean
    status?: boolean
    createdAt?: boolean
    pengaju?: boolean | UserDefaultArgs<ExtArgs>
    targetUser?: boolean | UserDefaultArgs<ExtArgs>
    shift?: boolean | ShiftDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["shiftSwapRequest"]>

  export type ShiftSwapRequestSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    pengajuId?: boolean
    targetUserId?: boolean
    shiftId?: boolean
    status?: boolean
    createdAt?: boolean
    pengaju?: boolean | UserDefaultArgs<ExtArgs>
    targetUser?: boolean | UserDefaultArgs<ExtArgs>
    shift?: boolean | ShiftDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["shiftSwapRequest"]>

  export type ShiftSwapRequestSelectScalar = {
    id?: boolean
    pengajuId?: boolean
    targetUserId?: boolean
    shiftId?: boolean
    status?: boolean
    createdAt?: boolean
  }

  export type ShiftSwapRequestOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "pengajuId" | "targetUserId" | "shiftId" | "status" | "createdAt", ExtArgs["result"]["shiftSwapRequest"]>
  export type ShiftSwapRequestInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    pengaju?: boolean | UserDefaultArgs<ExtArgs>
    targetUser?: boolean | UserDefaultArgs<ExtArgs>
    shift?: boolean | ShiftDefaultArgs<ExtArgs>
  }
  export type ShiftSwapRequestIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    pengaju?: boolean | UserDefaultArgs<ExtArgs>
    targetUser?: boolean | UserDefaultArgs<ExtArgs>
    shift?: boolean | ShiftDefaultArgs<ExtArgs>
  }
  export type ShiftSwapRequestIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    pengaju?: boolean | UserDefaultArgs<ExtArgs>
    targetUser?: boolean | UserDefaultArgs<ExtArgs>
    shift?: boolean | ShiftDefaultArgs<ExtArgs>
  }

  export type $ShiftSwapRequestPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "ShiftSwapRequest"
    objects: {
      pengaju: Prisma.$UserPayload<ExtArgs>
      targetUser: Prisma.$UserPayload<ExtArgs>
      shift: Prisma.$ShiftPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: number
      pengajuId: number
      targetUserId: number
      shiftId: number
      status: $Enums.SwapStatus
      createdAt: Date
    }, ExtArgs["result"]["shiftSwapRequest"]>
    composites: {}
  }

  type ShiftSwapRequestGetPayload<S extends boolean | null | undefined | ShiftSwapRequestDefaultArgs> = $Result.GetResult<Prisma.$ShiftSwapRequestPayload, S>

  type ShiftSwapRequestCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<ShiftSwapRequestFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: ShiftSwapRequestCountAggregateInputType | true
    }

  export interface ShiftSwapRequestDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['ShiftSwapRequest'], meta: { name: 'ShiftSwapRequest' } }
    /**
     * Find zero or one ShiftSwapRequest that matches the filter.
     * @param {ShiftSwapRequestFindUniqueArgs} args - Arguments to find a ShiftSwapRequest
     * @example
     * // Get one ShiftSwapRequest
     * const shiftSwapRequest = await prisma.shiftSwapRequest.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ShiftSwapRequestFindUniqueArgs>(args: SelectSubset<T, ShiftSwapRequestFindUniqueArgs<ExtArgs>>): Prisma__ShiftSwapRequestClient<$Result.GetResult<Prisma.$ShiftSwapRequestPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one ShiftSwapRequest that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {ShiftSwapRequestFindUniqueOrThrowArgs} args - Arguments to find a ShiftSwapRequest
     * @example
     * // Get one ShiftSwapRequest
     * const shiftSwapRequest = await prisma.shiftSwapRequest.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ShiftSwapRequestFindUniqueOrThrowArgs>(args: SelectSubset<T, ShiftSwapRequestFindUniqueOrThrowArgs<ExtArgs>>): Prisma__ShiftSwapRequestClient<$Result.GetResult<Prisma.$ShiftSwapRequestPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first ShiftSwapRequest that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ShiftSwapRequestFindFirstArgs} args - Arguments to find a ShiftSwapRequest
     * @example
     * // Get one ShiftSwapRequest
     * const shiftSwapRequest = await prisma.shiftSwapRequest.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ShiftSwapRequestFindFirstArgs>(args?: SelectSubset<T, ShiftSwapRequestFindFirstArgs<ExtArgs>>): Prisma__ShiftSwapRequestClient<$Result.GetResult<Prisma.$ShiftSwapRequestPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first ShiftSwapRequest that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ShiftSwapRequestFindFirstOrThrowArgs} args - Arguments to find a ShiftSwapRequest
     * @example
     * // Get one ShiftSwapRequest
     * const shiftSwapRequest = await prisma.shiftSwapRequest.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ShiftSwapRequestFindFirstOrThrowArgs>(args?: SelectSubset<T, ShiftSwapRequestFindFirstOrThrowArgs<ExtArgs>>): Prisma__ShiftSwapRequestClient<$Result.GetResult<Prisma.$ShiftSwapRequestPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more ShiftSwapRequests that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ShiftSwapRequestFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all ShiftSwapRequests
     * const shiftSwapRequests = await prisma.shiftSwapRequest.findMany()
     * 
     * // Get first 10 ShiftSwapRequests
     * const shiftSwapRequests = await prisma.shiftSwapRequest.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const shiftSwapRequestWithIdOnly = await prisma.shiftSwapRequest.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends ShiftSwapRequestFindManyArgs>(args?: SelectSubset<T, ShiftSwapRequestFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ShiftSwapRequestPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a ShiftSwapRequest.
     * @param {ShiftSwapRequestCreateArgs} args - Arguments to create a ShiftSwapRequest.
     * @example
     * // Create one ShiftSwapRequest
     * const ShiftSwapRequest = await prisma.shiftSwapRequest.create({
     *   data: {
     *     // ... data to create a ShiftSwapRequest
     *   }
     * })
     * 
     */
    create<T extends ShiftSwapRequestCreateArgs>(args: SelectSubset<T, ShiftSwapRequestCreateArgs<ExtArgs>>): Prisma__ShiftSwapRequestClient<$Result.GetResult<Prisma.$ShiftSwapRequestPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many ShiftSwapRequests.
     * @param {ShiftSwapRequestCreateManyArgs} args - Arguments to create many ShiftSwapRequests.
     * @example
     * // Create many ShiftSwapRequests
     * const shiftSwapRequest = await prisma.shiftSwapRequest.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends ShiftSwapRequestCreateManyArgs>(args?: SelectSubset<T, ShiftSwapRequestCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many ShiftSwapRequests and returns the data saved in the database.
     * @param {ShiftSwapRequestCreateManyAndReturnArgs} args - Arguments to create many ShiftSwapRequests.
     * @example
     * // Create many ShiftSwapRequests
     * const shiftSwapRequest = await prisma.shiftSwapRequest.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many ShiftSwapRequests and only return the `id`
     * const shiftSwapRequestWithIdOnly = await prisma.shiftSwapRequest.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends ShiftSwapRequestCreateManyAndReturnArgs>(args?: SelectSubset<T, ShiftSwapRequestCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ShiftSwapRequestPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a ShiftSwapRequest.
     * @param {ShiftSwapRequestDeleteArgs} args - Arguments to delete one ShiftSwapRequest.
     * @example
     * // Delete one ShiftSwapRequest
     * const ShiftSwapRequest = await prisma.shiftSwapRequest.delete({
     *   where: {
     *     // ... filter to delete one ShiftSwapRequest
     *   }
     * })
     * 
     */
    delete<T extends ShiftSwapRequestDeleteArgs>(args: SelectSubset<T, ShiftSwapRequestDeleteArgs<ExtArgs>>): Prisma__ShiftSwapRequestClient<$Result.GetResult<Prisma.$ShiftSwapRequestPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one ShiftSwapRequest.
     * @param {ShiftSwapRequestUpdateArgs} args - Arguments to update one ShiftSwapRequest.
     * @example
     * // Update one ShiftSwapRequest
     * const shiftSwapRequest = await prisma.shiftSwapRequest.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends ShiftSwapRequestUpdateArgs>(args: SelectSubset<T, ShiftSwapRequestUpdateArgs<ExtArgs>>): Prisma__ShiftSwapRequestClient<$Result.GetResult<Prisma.$ShiftSwapRequestPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more ShiftSwapRequests.
     * @param {ShiftSwapRequestDeleteManyArgs} args - Arguments to filter ShiftSwapRequests to delete.
     * @example
     * // Delete a few ShiftSwapRequests
     * const { count } = await prisma.shiftSwapRequest.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends ShiftSwapRequestDeleteManyArgs>(args?: SelectSubset<T, ShiftSwapRequestDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more ShiftSwapRequests.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ShiftSwapRequestUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many ShiftSwapRequests
     * const shiftSwapRequest = await prisma.shiftSwapRequest.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends ShiftSwapRequestUpdateManyArgs>(args: SelectSubset<T, ShiftSwapRequestUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more ShiftSwapRequests and returns the data updated in the database.
     * @param {ShiftSwapRequestUpdateManyAndReturnArgs} args - Arguments to update many ShiftSwapRequests.
     * @example
     * // Update many ShiftSwapRequests
     * const shiftSwapRequest = await prisma.shiftSwapRequest.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more ShiftSwapRequests and only return the `id`
     * const shiftSwapRequestWithIdOnly = await prisma.shiftSwapRequest.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends ShiftSwapRequestUpdateManyAndReturnArgs>(args: SelectSubset<T, ShiftSwapRequestUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ShiftSwapRequestPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one ShiftSwapRequest.
     * @param {ShiftSwapRequestUpsertArgs} args - Arguments to update or create a ShiftSwapRequest.
     * @example
     * // Update or create a ShiftSwapRequest
     * const shiftSwapRequest = await prisma.shiftSwapRequest.upsert({
     *   create: {
     *     // ... data to create a ShiftSwapRequest
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the ShiftSwapRequest we want to update
     *   }
     * })
     */
    upsert<T extends ShiftSwapRequestUpsertArgs>(args: SelectSubset<T, ShiftSwapRequestUpsertArgs<ExtArgs>>): Prisma__ShiftSwapRequestClient<$Result.GetResult<Prisma.$ShiftSwapRequestPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of ShiftSwapRequests.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ShiftSwapRequestCountArgs} args - Arguments to filter ShiftSwapRequests to count.
     * @example
     * // Count the number of ShiftSwapRequests
     * const count = await prisma.shiftSwapRequest.count({
     *   where: {
     *     // ... the filter for the ShiftSwapRequests we want to count
     *   }
     * })
    **/
    count<T extends ShiftSwapRequestCountArgs>(
      args?: Subset<T, ShiftSwapRequestCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], ShiftSwapRequestCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a ShiftSwapRequest.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ShiftSwapRequestAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends ShiftSwapRequestAggregateArgs>(args: Subset<T, ShiftSwapRequestAggregateArgs>): Prisma.PrismaPromise<GetShiftSwapRequestAggregateType<T>>

    /**
     * Group by ShiftSwapRequest.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ShiftSwapRequestGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends ShiftSwapRequestGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ShiftSwapRequestGroupByArgs['orderBy'] }
        : { orderBy?: ShiftSwapRequestGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, ShiftSwapRequestGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetShiftSwapRequestGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the ShiftSwapRequest model
   */
  readonly fields: ShiftSwapRequestFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for ShiftSwapRequest.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ShiftSwapRequestClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    pengaju<T extends UserDefaultArgs<ExtArgs> = {}>(args?: Subset<T, UserDefaultArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    targetUser<T extends UserDefaultArgs<ExtArgs> = {}>(args?: Subset<T, UserDefaultArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    shift<T extends ShiftDefaultArgs<ExtArgs> = {}>(args?: Subset<T, ShiftDefaultArgs<ExtArgs>>): Prisma__ShiftClient<$Result.GetResult<Prisma.$ShiftPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the ShiftSwapRequest model
   */
  interface ShiftSwapRequestFieldRefs {
    readonly id: FieldRef<"ShiftSwapRequest", 'Int'>
    readonly pengajuId: FieldRef<"ShiftSwapRequest", 'Int'>
    readonly targetUserId: FieldRef<"ShiftSwapRequest", 'Int'>
    readonly shiftId: FieldRef<"ShiftSwapRequest", 'Int'>
    readonly status: FieldRef<"ShiftSwapRequest", 'SwapStatus'>
    readonly createdAt: FieldRef<"ShiftSwapRequest", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * ShiftSwapRequest findUnique
   */
  export type ShiftSwapRequestFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ShiftSwapRequest
     */
    select?: ShiftSwapRequestSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ShiftSwapRequest
     */
    omit?: ShiftSwapRequestOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ShiftSwapRequestInclude<ExtArgs> | null
    /**
     * Filter, which ShiftSwapRequest to fetch.
     */
    where: ShiftSwapRequestWhereUniqueInput
  }

  /**
   * ShiftSwapRequest findUniqueOrThrow
   */
  export type ShiftSwapRequestFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ShiftSwapRequest
     */
    select?: ShiftSwapRequestSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ShiftSwapRequest
     */
    omit?: ShiftSwapRequestOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ShiftSwapRequestInclude<ExtArgs> | null
    /**
     * Filter, which ShiftSwapRequest to fetch.
     */
    where: ShiftSwapRequestWhereUniqueInput
  }

  /**
   * ShiftSwapRequest findFirst
   */
  export type ShiftSwapRequestFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ShiftSwapRequest
     */
    select?: ShiftSwapRequestSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ShiftSwapRequest
     */
    omit?: ShiftSwapRequestOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ShiftSwapRequestInclude<ExtArgs> | null
    /**
     * Filter, which ShiftSwapRequest to fetch.
     */
    where?: ShiftSwapRequestWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ShiftSwapRequests to fetch.
     */
    orderBy?: ShiftSwapRequestOrderByWithRelationInput | ShiftSwapRequestOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ShiftSwapRequests.
     */
    cursor?: ShiftSwapRequestWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ShiftSwapRequests from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ShiftSwapRequests.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ShiftSwapRequests.
     */
    distinct?: ShiftSwapRequestScalarFieldEnum | ShiftSwapRequestScalarFieldEnum[]
  }

  /**
   * ShiftSwapRequest findFirstOrThrow
   */
  export type ShiftSwapRequestFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ShiftSwapRequest
     */
    select?: ShiftSwapRequestSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ShiftSwapRequest
     */
    omit?: ShiftSwapRequestOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ShiftSwapRequestInclude<ExtArgs> | null
    /**
     * Filter, which ShiftSwapRequest to fetch.
     */
    where?: ShiftSwapRequestWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ShiftSwapRequests to fetch.
     */
    orderBy?: ShiftSwapRequestOrderByWithRelationInput | ShiftSwapRequestOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ShiftSwapRequests.
     */
    cursor?: ShiftSwapRequestWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ShiftSwapRequests from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ShiftSwapRequests.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ShiftSwapRequests.
     */
    distinct?: ShiftSwapRequestScalarFieldEnum | ShiftSwapRequestScalarFieldEnum[]
  }

  /**
   * ShiftSwapRequest findMany
   */
  export type ShiftSwapRequestFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ShiftSwapRequest
     */
    select?: ShiftSwapRequestSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ShiftSwapRequest
     */
    omit?: ShiftSwapRequestOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ShiftSwapRequestInclude<ExtArgs> | null
    /**
     * Filter, which ShiftSwapRequests to fetch.
     */
    where?: ShiftSwapRequestWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ShiftSwapRequests to fetch.
     */
    orderBy?: ShiftSwapRequestOrderByWithRelationInput | ShiftSwapRequestOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing ShiftSwapRequests.
     */
    cursor?: ShiftSwapRequestWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ShiftSwapRequests from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ShiftSwapRequests.
     */
    skip?: number
    distinct?: ShiftSwapRequestScalarFieldEnum | ShiftSwapRequestScalarFieldEnum[]
  }

  /**
   * ShiftSwapRequest create
   */
  export type ShiftSwapRequestCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ShiftSwapRequest
     */
    select?: ShiftSwapRequestSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ShiftSwapRequest
     */
    omit?: ShiftSwapRequestOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ShiftSwapRequestInclude<ExtArgs> | null
    /**
     * The data needed to create a ShiftSwapRequest.
     */
    data: XOR<ShiftSwapRequestCreateInput, ShiftSwapRequestUncheckedCreateInput>
  }

  /**
   * ShiftSwapRequest createMany
   */
  export type ShiftSwapRequestCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many ShiftSwapRequests.
     */
    data: ShiftSwapRequestCreateManyInput | ShiftSwapRequestCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * ShiftSwapRequest createManyAndReturn
   */
  export type ShiftSwapRequestCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ShiftSwapRequest
     */
    select?: ShiftSwapRequestSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the ShiftSwapRequest
     */
    omit?: ShiftSwapRequestOmit<ExtArgs> | null
    /**
     * The data used to create many ShiftSwapRequests.
     */
    data: ShiftSwapRequestCreateManyInput | ShiftSwapRequestCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ShiftSwapRequestIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * ShiftSwapRequest update
   */
  export type ShiftSwapRequestUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ShiftSwapRequest
     */
    select?: ShiftSwapRequestSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ShiftSwapRequest
     */
    omit?: ShiftSwapRequestOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ShiftSwapRequestInclude<ExtArgs> | null
    /**
     * The data needed to update a ShiftSwapRequest.
     */
    data: XOR<ShiftSwapRequestUpdateInput, ShiftSwapRequestUncheckedUpdateInput>
    /**
     * Choose, which ShiftSwapRequest to update.
     */
    where: ShiftSwapRequestWhereUniqueInput
  }

  /**
   * ShiftSwapRequest updateMany
   */
  export type ShiftSwapRequestUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update ShiftSwapRequests.
     */
    data: XOR<ShiftSwapRequestUpdateManyMutationInput, ShiftSwapRequestUncheckedUpdateManyInput>
    /**
     * Filter which ShiftSwapRequests to update
     */
    where?: ShiftSwapRequestWhereInput
    /**
     * Limit how many ShiftSwapRequests to update.
     */
    limit?: number
  }

  /**
   * ShiftSwapRequest updateManyAndReturn
   */
  export type ShiftSwapRequestUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ShiftSwapRequest
     */
    select?: ShiftSwapRequestSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the ShiftSwapRequest
     */
    omit?: ShiftSwapRequestOmit<ExtArgs> | null
    /**
     * The data used to update ShiftSwapRequests.
     */
    data: XOR<ShiftSwapRequestUpdateManyMutationInput, ShiftSwapRequestUncheckedUpdateManyInput>
    /**
     * Filter which ShiftSwapRequests to update
     */
    where?: ShiftSwapRequestWhereInput
    /**
     * Limit how many ShiftSwapRequests to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ShiftSwapRequestIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * ShiftSwapRequest upsert
   */
  export type ShiftSwapRequestUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ShiftSwapRequest
     */
    select?: ShiftSwapRequestSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ShiftSwapRequest
     */
    omit?: ShiftSwapRequestOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ShiftSwapRequestInclude<ExtArgs> | null
    /**
     * The filter to search for the ShiftSwapRequest to update in case it exists.
     */
    where: ShiftSwapRequestWhereUniqueInput
    /**
     * In case the ShiftSwapRequest found by the `where` argument doesn't exist, create a new ShiftSwapRequest with this data.
     */
    create: XOR<ShiftSwapRequestCreateInput, ShiftSwapRequestUncheckedCreateInput>
    /**
     * In case the ShiftSwapRequest was found with the provided `where` argument, update it with this data.
     */
    update: XOR<ShiftSwapRequestUpdateInput, ShiftSwapRequestUncheckedUpdateInput>
  }

  /**
   * ShiftSwapRequest delete
   */
  export type ShiftSwapRequestDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ShiftSwapRequest
     */
    select?: ShiftSwapRequestSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ShiftSwapRequest
     */
    omit?: ShiftSwapRequestOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ShiftSwapRequestInclude<ExtArgs> | null
    /**
     * Filter which ShiftSwapRequest to delete.
     */
    where: ShiftSwapRequestWhereUniqueInput
  }

  /**
   * ShiftSwapRequest deleteMany
   */
  export type ShiftSwapRequestDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ShiftSwapRequests to delete
     */
    where?: ShiftSwapRequestWhereInput
    /**
     * Limit how many ShiftSwapRequests to delete.
     */
    limit?: number
  }

  /**
   * ShiftSwapRequest without action
   */
  export type ShiftSwapRequestDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ShiftSwapRequest
     */
    select?: ShiftSwapRequestSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ShiftSwapRequest
     */
    omit?: ShiftSwapRequestOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ShiftSwapRequestInclude<ExtArgs> | null
  }


  /**
   * Enums
   */

  export const TransactionIsolationLevel: {
    ReadUncommitted: 'ReadUncommitted',
    ReadCommitted: 'ReadCommitted',
    RepeatableRead: 'RepeatableRead',
    Serializable: 'Serializable'
  };

  export type TransactionIsolationLevel = (typeof TransactionIsolationLevel)[keyof typeof TransactionIsolationLevel]


  export const UserScalarFieldEnum: {
    id: 'id',
    nama: 'nama',
    email: 'email',
    password: 'password',
    role: 'role',
    nomorHP: 'nomorHP',
    idPegawai: 'idPegawai',
    unitKerja: 'unitKerja',
    createdAt: 'createdAt'
  };

  export type UserScalarFieldEnum = (typeof UserScalarFieldEnum)[keyof typeof UserScalarFieldEnum]


  export const ShiftScalarFieldEnum: {
    id: 'id',
    tanggal: 'tanggal',
    jamMulai: 'jamMulai',
    jamSelesai: 'jamSelesai',
    lokasiShift: 'lokasiShift',
    userId: 'userId',
    createdAt: 'createdAt'
  };

  export type ShiftScalarFieldEnum = (typeof ShiftScalarFieldEnum)[keyof typeof ShiftScalarFieldEnum]


  export const AbsensiScalarFieldEnum: {
    id: 'id',
    tanggal: 'tanggal',
    jamMasuk: 'jamMasuk',
    jamKeluar: 'jamKeluar',
    status: 'status',
    userId: 'userId',
    createdAt: 'createdAt'
  };

  export type AbsensiScalarFieldEnum = (typeof AbsensiScalarFieldEnum)[keyof typeof AbsensiScalarFieldEnum]


  export const ShiftSwapRequestScalarFieldEnum: {
    id: 'id',
    pengajuId: 'pengajuId',
    targetUserId: 'targetUserId',
    shiftId: 'shiftId',
    status: 'status',
    createdAt: 'createdAt'
  };

  export type ShiftSwapRequestScalarFieldEnum = (typeof ShiftSwapRequestScalarFieldEnum)[keyof typeof ShiftSwapRequestScalarFieldEnum]


  export const SortOrder: {
    asc: 'asc',
    desc: 'desc'
  };

  export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder]


  export const QueryMode: {
    default: 'default',
    insensitive: 'insensitive'
  };

  export type QueryMode = (typeof QueryMode)[keyof typeof QueryMode]


  export const NullsOrder: {
    first: 'first',
    last: 'last'
  };

  export type NullsOrder = (typeof NullsOrder)[keyof typeof NullsOrder]


  /**
   * Field references
   */


  /**
   * Reference to a field of type 'Int'
   */
  export type IntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int'>
    


  /**
   * Reference to a field of type 'Int[]'
   */
  export type ListIntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int[]'>
    


  /**
   * Reference to a field of type 'String'
   */
  export type StringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String'>
    


  /**
   * Reference to a field of type 'String[]'
   */
  export type ListStringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String[]'>
    


  /**
   * Reference to a field of type 'Role'
   */
  export type EnumRoleFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Role'>
    


  /**
   * Reference to a field of type 'Role[]'
   */
  export type ListEnumRoleFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Role[]'>
    


  /**
   * Reference to a field of type 'DateTime'
   */
  export type DateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime'>
    


  /**
   * Reference to a field of type 'DateTime[]'
   */
  export type ListDateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime[]'>
    


  /**
   * Reference to a field of type 'AbsensiStatus'
   */
  export type EnumAbsensiStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'AbsensiStatus'>
    


  /**
   * Reference to a field of type 'AbsensiStatus[]'
   */
  export type ListEnumAbsensiStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'AbsensiStatus[]'>
    


  /**
   * Reference to a field of type 'SwapStatus'
   */
  export type EnumSwapStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'SwapStatus'>
    


  /**
   * Reference to a field of type 'SwapStatus[]'
   */
  export type ListEnumSwapStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'SwapStatus[]'>
    


  /**
   * Reference to a field of type 'Float'
   */
  export type FloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float'>
    


  /**
   * Reference to a field of type 'Float[]'
   */
  export type ListFloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float[]'>
    
  /**
   * Deep Input Types
   */


  export type UserWhereInput = {
    AND?: UserWhereInput | UserWhereInput[]
    OR?: UserWhereInput[]
    NOT?: UserWhereInput | UserWhereInput[]
    id?: IntFilter<"User"> | number
    nama?: StringFilter<"User"> | string
    email?: StringFilter<"User"> | string
    password?: StringFilter<"User"> | string
    role?: EnumRoleFilter<"User"> | $Enums.Role
    nomorHP?: StringNullableFilter<"User"> | string | null
    idPegawai?: StringFilter<"User"> | string
    unitKerja?: StringNullableFilter<"User"> | string | null
    createdAt?: DateTimeFilter<"User"> | Date | string
    absensi?: AbsensiListRelationFilter
    shift?: ShiftListRelationFilter
    shiftRequestsPengaju?: ShiftSwapRequestListRelationFilter
    shiftRequestsTarget?: ShiftSwapRequestListRelationFilter
  }

  export type UserOrderByWithRelationInput = {
    id?: SortOrder
    nama?: SortOrder
    email?: SortOrder
    password?: SortOrder
    role?: SortOrder
    nomorHP?: SortOrderInput | SortOrder
    idPegawai?: SortOrder
    unitKerja?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    absensi?: AbsensiOrderByRelationAggregateInput
    shift?: ShiftOrderByRelationAggregateInput
    shiftRequestsPengaju?: ShiftSwapRequestOrderByRelationAggregateInput
    shiftRequestsTarget?: ShiftSwapRequestOrderByRelationAggregateInput
  }

  export type UserWhereUniqueInput = Prisma.AtLeast<{
    id?: number
    email?: string
    idPegawai?: string
    AND?: UserWhereInput | UserWhereInput[]
    OR?: UserWhereInput[]
    NOT?: UserWhereInput | UserWhereInput[]
    nama?: StringFilter<"User"> | string
    password?: StringFilter<"User"> | string
    role?: EnumRoleFilter<"User"> | $Enums.Role
    nomorHP?: StringNullableFilter<"User"> | string | null
    unitKerja?: StringNullableFilter<"User"> | string | null
    createdAt?: DateTimeFilter<"User"> | Date | string
    absensi?: AbsensiListRelationFilter
    shift?: ShiftListRelationFilter
    shiftRequestsPengaju?: ShiftSwapRequestListRelationFilter
    shiftRequestsTarget?: ShiftSwapRequestListRelationFilter
  }, "id" | "email" | "idPegawai">

  export type UserOrderByWithAggregationInput = {
    id?: SortOrder
    nama?: SortOrder
    email?: SortOrder
    password?: SortOrder
    role?: SortOrder
    nomorHP?: SortOrderInput | SortOrder
    idPegawai?: SortOrder
    unitKerja?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    _count?: UserCountOrderByAggregateInput
    _avg?: UserAvgOrderByAggregateInput
    _max?: UserMaxOrderByAggregateInput
    _min?: UserMinOrderByAggregateInput
    _sum?: UserSumOrderByAggregateInput
  }

  export type UserScalarWhereWithAggregatesInput = {
    AND?: UserScalarWhereWithAggregatesInput | UserScalarWhereWithAggregatesInput[]
    OR?: UserScalarWhereWithAggregatesInput[]
    NOT?: UserScalarWhereWithAggregatesInput | UserScalarWhereWithAggregatesInput[]
    id?: IntWithAggregatesFilter<"User"> | number
    nama?: StringWithAggregatesFilter<"User"> | string
    email?: StringWithAggregatesFilter<"User"> | string
    password?: StringWithAggregatesFilter<"User"> | string
    role?: EnumRoleWithAggregatesFilter<"User"> | $Enums.Role
    nomorHP?: StringNullableWithAggregatesFilter<"User"> | string | null
    idPegawai?: StringWithAggregatesFilter<"User"> | string
    unitKerja?: StringNullableWithAggregatesFilter<"User"> | string | null
    createdAt?: DateTimeWithAggregatesFilter<"User"> | Date | string
  }

  export type ShiftWhereInput = {
    AND?: ShiftWhereInput | ShiftWhereInput[]
    OR?: ShiftWhereInput[]
    NOT?: ShiftWhereInput | ShiftWhereInput[]
    id?: IntFilter<"Shift"> | number
    tanggal?: DateTimeFilter<"Shift"> | Date | string
    jamMulai?: StringFilter<"Shift"> | string
    jamSelesai?: StringFilter<"Shift"> | string
    lokasiShift?: StringFilter<"Shift"> | string
    userId?: IntFilter<"Shift"> | number
    createdAt?: DateTimeFilter<"Shift"> | Date | string
    user?: XOR<UserScalarRelationFilter, UserWhereInput>
    swapRequests?: ShiftSwapRequestListRelationFilter
  }

  export type ShiftOrderByWithRelationInput = {
    id?: SortOrder
    tanggal?: SortOrder
    jamMulai?: SortOrder
    jamSelesai?: SortOrder
    lokasiShift?: SortOrder
    userId?: SortOrder
    createdAt?: SortOrder
    user?: UserOrderByWithRelationInput
    swapRequests?: ShiftSwapRequestOrderByRelationAggregateInput
  }

  export type ShiftWhereUniqueInput = Prisma.AtLeast<{
    id?: number
    AND?: ShiftWhereInput | ShiftWhereInput[]
    OR?: ShiftWhereInput[]
    NOT?: ShiftWhereInput | ShiftWhereInput[]
    tanggal?: DateTimeFilter<"Shift"> | Date | string
    jamMulai?: StringFilter<"Shift"> | string
    jamSelesai?: StringFilter<"Shift"> | string
    lokasiShift?: StringFilter<"Shift"> | string
    userId?: IntFilter<"Shift"> | number
    createdAt?: DateTimeFilter<"Shift"> | Date | string
    user?: XOR<UserScalarRelationFilter, UserWhereInput>
    swapRequests?: ShiftSwapRequestListRelationFilter
  }, "id">

  export type ShiftOrderByWithAggregationInput = {
    id?: SortOrder
    tanggal?: SortOrder
    jamMulai?: SortOrder
    jamSelesai?: SortOrder
    lokasiShift?: SortOrder
    userId?: SortOrder
    createdAt?: SortOrder
    _count?: ShiftCountOrderByAggregateInput
    _avg?: ShiftAvgOrderByAggregateInput
    _max?: ShiftMaxOrderByAggregateInput
    _min?: ShiftMinOrderByAggregateInput
    _sum?: ShiftSumOrderByAggregateInput
  }

  export type ShiftScalarWhereWithAggregatesInput = {
    AND?: ShiftScalarWhereWithAggregatesInput | ShiftScalarWhereWithAggregatesInput[]
    OR?: ShiftScalarWhereWithAggregatesInput[]
    NOT?: ShiftScalarWhereWithAggregatesInput | ShiftScalarWhereWithAggregatesInput[]
    id?: IntWithAggregatesFilter<"Shift"> | number
    tanggal?: DateTimeWithAggregatesFilter<"Shift"> | Date | string
    jamMulai?: StringWithAggregatesFilter<"Shift"> | string
    jamSelesai?: StringWithAggregatesFilter<"Shift"> | string
    lokasiShift?: StringWithAggregatesFilter<"Shift"> | string
    userId?: IntWithAggregatesFilter<"Shift"> | number
    createdAt?: DateTimeWithAggregatesFilter<"Shift"> | Date | string
  }

  export type AbsensiWhereInput = {
    AND?: AbsensiWhereInput | AbsensiWhereInput[]
    OR?: AbsensiWhereInput[]
    NOT?: AbsensiWhereInput | AbsensiWhereInput[]
    id?: IntFilter<"Absensi"> | number
    tanggal?: DateTimeFilter<"Absensi"> | Date | string
    jamMasuk?: StringNullableFilter<"Absensi"> | string | null
    jamKeluar?: StringNullableFilter<"Absensi"> | string | null
    status?: EnumAbsensiStatusFilter<"Absensi"> | $Enums.AbsensiStatus
    userId?: IntFilter<"Absensi"> | number
    createdAt?: DateTimeFilter<"Absensi"> | Date | string
    user?: XOR<UserScalarRelationFilter, UserWhereInput>
  }

  export type AbsensiOrderByWithRelationInput = {
    id?: SortOrder
    tanggal?: SortOrder
    jamMasuk?: SortOrderInput | SortOrder
    jamKeluar?: SortOrderInput | SortOrder
    status?: SortOrder
    userId?: SortOrder
    createdAt?: SortOrder
    user?: UserOrderByWithRelationInput
  }

  export type AbsensiWhereUniqueInput = Prisma.AtLeast<{
    id?: number
    AND?: AbsensiWhereInput | AbsensiWhereInput[]
    OR?: AbsensiWhereInput[]
    NOT?: AbsensiWhereInput | AbsensiWhereInput[]
    tanggal?: DateTimeFilter<"Absensi"> | Date | string
    jamMasuk?: StringNullableFilter<"Absensi"> | string | null
    jamKeluar?: StringNullableFilter<"Absensi"> | string | null
    status?: EnumAbsensiStatusFilter<"Absensi"> | $Enums.AbsensiStatus
    userId?: IntFilter<"Absensi"> | number
    createdAt?: DateTimeFilter<"Absensi"> | Date | string
    user?: XOR<UserScalarRelationFilter, UserWhereInput>
  }, "id">

  export type AbsensiOrderByWithAggregationInput = {
    id?: SortOrder
    tanggal?: SortOrder
    jamMasuk?: SortOrderInput | SortOrder
    jamKeluar?: SortOrderInput | SortOrder
    status?: SortOrder
    userId?: SortOrder
    createdAt?: SortOrder
    _count?: AbsensiCountOrderByAggregateInput
    _avg?: AbsensiAvgOrderByAggregateInput
    _max?: AbsensiMaxOrderByAggregateInput
    _min?: AbsensiMinOrderByAggregateInput
    _sum?: AbsensiSumOrderByAggregateInput
  }

  export type AbsensiScalarWhereWithAggregatesInput = {
    AND?: AbsensiScalarWhereWithAggregatesInput | AbsensiScalarWhereWithAggregatesInput[]
    OR?: AbsensiScalarWhereWithAggregatesInput[]
    NOT?: AbsensiScalarWhereWithAggregatesInput | AbsensiScalarWhereWithAggregatesInput[]
    id?: IntWithAggregatesFilter<"Absensi"> | number
    tanggal?: DateTimeWithAggregatesFilter<"Absensi"> | Date | string
    jamMasuk?: StringNullableWithAggregatesFilter<"Absensi"> | string | null
    jamKeluar?: StringNullableWithAggregatesFilter<"Absensi"> | string | null
    status?: EnumAbsensiStatusWithAggregatesFilter<"Absensi"> | $Enums.AbsensiStatus
    userId?: IntWithAggregatesFilter<"Absensi"> | number
    createdAt?: DateTimeWithAggregatesFilter<"Absensi"> | Date | string
  }

  export type ShiftSwapRequestWhereInput = {
    AND?: ShiftSwapRequestWhereInput | ShiftSwapRequestWhereInput[]
    OR?: ShiftSwapRequestWhereInput[]
    NOT?: ShiftSwapRequestWhereInput | ShiftSwapRequestWhereInput[]
    id?: IntFilter<"ShiftSwapRequest"> | number
    pengajuId?: IntFilter<"ShiftSwapRequest"> | number
    targetUserId?: IntFilter<"ShiftSwapRequest"> | number
    shiftId?: IntFilter<"ShiftSwapRequest"> | number
    status?: EnumSwapStatusFilter<"ShiftSwapRequest"> | $Enums.SwapStatus
    createdAt?: DateTimeFilter<"ShiftSwapRequest"> | Date | string
    pengaju?: XOR<UserScalarRelationFilter, UserWhereInput>
    targetUser?: XOR<UserScalarRelationFilter, UserWhereInput>
    shift?: XOR<ShiftScalarRelationFilter, ShiftWhereInput>
  }

  export type ShiftSwapRequestOrderByWithRelationInput = {
    id?: SortOrder
    pengajuId?: SortOrder
    targetUserId?: SortOrder
    shiftId?: SortOrder
    status?: SortOrder
    createdAt?: SortOrder
    pengaju?: UserOrderByWithRelationInput
    targetUser?: UserOrderByWithRelationInput
    shift?: ShiftOrderByWithRelationInput
  }

  export type ShiftSwapRequestWhereUniqueInput = Prisma.AtLeast<{
    id?: number
    AND?: ShiftSwapRequestWhereInput | ShiftSwapRequestWhereInput[]
    OR?: ShiftSwapRequestWhereInput[]
    NOT?: ShiftSwapRequestWhereInput | ShiftSwapRequestWhereInput[]
    pengajuId?: IntFilter<"ShiftSwapRequest"> | number
    targetUserId?: IntFilter<"ShiftSwapRequest"> | number
    shiftId?: IntFilter<"ShiftSwapRequest"> | number
    status?: EnumSwapStatusFilter<"ShiftSwapRequest"> | $Enums.SwapStatus
    createdAt?: DateTimeFilter<"ShiftSwapRequest"> | Date | string
    pengaju?: XOR<UserScalarRelationFilter, UserWhereInput>
    targetUser?: XOR<UserScalarRelationFilter, UserWhereInput>
    shift?: XOR<ShiftScalarRelationFilter, ShiftWhereInput>
  }, "id">

  export type ShiftSwapRequestOrderByWithAggregationInput = {
    id?: SortOrder
    pengajuId?: SortOrder
    targetUserId?: SortOrder
    shiftId?: SortOrder
    status?: SortOrder
    createdAt?: SortOrder
    _count?: ShiftSwapRequestCountOrderByAggregateInput
    _avg?: ShiftSwapRequestAvgOrderByAggregateInput
    _max?: ShiftSwapRequestMaxOrderByAggregateInput
    _min?: ShiftSwapRequestMinOrderByAggregateInput
    _sum?: ShiftSwapRequestSumOrderByAggregateInput
  }

  export type ShiftSwapRequestScalarWhereWithAggregatesInput = {
    AND?: ShiftSwapRequestScalarWhereWithAggregatesInput | ShiftSwapRequestScalarWhereWithAggregatesInput[]
    OR?: ShiftSwapRequestScalarWhereWithAggregatesInput[]
    NOT?: ShiftSwapRequestScalarWhereWithAggregatesInput | ShiftSwapRequestScalarWhereWithAggregatesInput[]
    id?: IntWithAggregatesFilter<"ShiftSwapRequest"> | number
    pengajuId?: IntWithAggregatesFilter<"ShiftSwapRequest"> | number
    targetUserId?: IntWithAggregatesFilter<"ShiftSwapRequest"> | number
    shiftId?: IntWithAggregatesFilter<"ShiftSwapRequest"> | number
    status?: EnumSwapStatusWithAggregatesFilter<"ShiftSwapRequest"> | $Enums.SwapStatus
    createdAt?: DateTimeWithAggregatesFilter<"ShiftSwapRequest"> | Date | string
  }

  export type UserCreateInput = {
    nama: string
    email: string
    password: string
    role: $Enums.Role
    nomorHP?: string | null
    idPegawai: string
    unitKerja?: string | null
    createdAt?: Date | string
    absensi?: AbsensiCreateNestedManyWithoutUserInput
    shift?: ShiftCreateNestedManyWithoutUserInput
    shiftRequestsPengaju?: ShiftSwapRequestCreateNestedManyWithoutPengajuInput
    shiftRequestsTarget?: ShiftSwapRequestCreateNestedManyWithoutTargetUserInput
  }

  export type UserUncheckedCreateInput = {
    id?: number
    nama: string
    email: string
    password: string
    role: $Enums.Role
    nomorHP?: string | null
    idPegawai: string
    unitKerja?: string | null
    createdAt?: Date | string
    absensi?: AbsensiUncheckedCreateNestedManyWithoutUserInput
    shift?: ShiftUncheckedCreateNestedManyWithoutUserInput
    shiftRequestsPengaju?: ShiftSwapRequestUncheckedCreateNestedManyWithoutPengajuInput
    shiftRequestsTarget?: ShiftSwapRequestUncheckedCreateNestedManyWithoutTargetUserInput
  }

  export type UserUpdateInput = {
    nama?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    role?: EnumRoleFieldUpdateOperationsInput | $Enums.Role
    nomorHP?: NullableStringFieldUpdateOperationsInput | string | null
    idPegawai?: StringFieldUpdateOperationsInput | string
    unitKerja?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    absensi?: AbsensiUpdateManyWithoutUserNestedInput
    shift?: ShiftUpdateManyWithoutUserNestedInput
    shiftRequestsPengaju?: ShiftSwapRequestUpdateManyWithoutPengajuNestedInput
    shiftRequestsTarget?: ShiftSwapRequestUpdateManyWithoutTargetUserNestedInput
  }

  export type UserUncheckedUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number
    nama?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    role?: EnumRoleFieldUpdateOperationsInput | $Enums.Role
    nomorHP?: NullableStringFieldUpdateOperationsInput | string | null
    idPegawai?: StringFieldUpdateOperationsInput | string
    unitKerja?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    absensi?: AbsensiUncheckedUpdateManyWithoutUserNestedInput
    shift?: ShiftUncheckedUpdateManyWithoutUserNestedInput
    shiftRequestsPengaju?: ShiftSwapRequestUncheckedUpdateManyWithoutPengajuNestedInput
    shiftRequestsTarget?: ShiftSwapRequestUncheckedUpdateManyWithoutTargetUserNestedInput
  }

  export type UserCreateManyInput = {
    id?: number
    nama: string
    email: string
    password: string
    role: $Enums.Role
    nomorHP?: string | null
    idPegawai: string
    unitKerja?: string | null
    createdAt?: Date | string
  }

  export type UserUpdateManyMutationInput = {
    nama?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    role?: EnumRoleFieldUpdateOperationsInput | $Enums.Role
    nomorHP?: NullableStringFieldUpdateOperationsInput | string | null
    idPegawai?: StringFieldUpdateOperationsInput | string
    unitKerja?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserUncheckedUpdateManyInput = {
    id?: IntFieldUpdateOperationsInput | number
    nama?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    role?: EnumRoleFieldUpdateOperationsInput | $Enums.Role
    nomorHP?: NullableStringFieldUpdateOperationsInput | string | null
    idPegawai?: StringFieldUpdateOperationsInput | string
    unitKerja?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ShiftCreateInput = {
    tanggal: Date | string
    jamMulai: string
    jamSelesai: string
    lokasiShift: string
    createdAt?: Date | string
    user: UserCreateNestedOneWithoutShiftInput
    swapRequests?: ShiftSwapRequestCreateNestedManyWithoutShiftInput
  }

  export type ShiftUncheckedCreateInput = {
    id?: number
    tanggal: Date | string
    jamMulai: string
    jamSelesai: string
    lokasiShift: string
    userId: number
    createdAt?: Date | string
    swapRequests?: ShiftSwapRequestUncheckedCreateNestedManyWithoutShiftInput
  }

  export type ShiftUpdateInput = {
    tanggal?: DateTimeFieldUpdateOperationsInput | Date | string
    jamMulai?: StringFieldUpdateOperationsInput | string
    jamSelesai?: StringFieldUpdateOperationsInput | string
    lokasiShift?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    user?: UserUpdateOneRequiredWithoutShiftNestedInput
    swapRequests?: ShiftSwapRequestUpdateManyWithoutShiftNestedInput
  }

  export type ShiftUncheckedUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number
    tanggal?: DateTimeFieldUpdateOperationsInput | Date | string
    jamMulai?: StringFieldUpdateOperationsInput | string
    jamSelesai?: StringFieldUpdateOperationsInput | string
    lokasiShift?: StringFieldUpdateOperationsInput | string
    userId?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    swapRequests?: ShiftSwapRequestUncheckedUpdateManyWithoutShiftNestedInput
  }

  export type ShiftCreateManyInput = {
    id?: number
    tanggal: Date | string
    jamMulai: string
    jamSelesai: string
    lokasiShift: string
    userId: number
    createdAt?: Date | string
  }

  export type ShiftUpdateManyMutationInput = {
    tanggal?: DateTimeFieldUpdateOperationsInput | Date | string
    jamMulai?: StringFieldUpdateOperationsInput | string
    jamSelesai?: StringFieldUpdateOperationsInput | string
    lokasiShift?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ShiftUncheckedUpdateManyInput = {
    id?: IntFieldUpdateOperationsInput | number
    tanggal?: DateTimeFieldUpdateOperationsInput | Date | string
    jamMulai?: StringFieldUpdateOperationsInput | string
    jamSelesai?: StringFieldUpdateOperationsInput | string
    lokasiShift?: StringFieldUpdateOperationsInput | string
    userId?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AbsensiCreateInput = {
    tanggal: Date | string
    jamMasuk?: string | null
    jamKeluar?: string | null
    status: $Enums.AbsensiStatus
    createdAt?: Date | string
    user: UserCreateNestedOneWithoutAbsensiInput
  }

  export type AbsensiUncheckedCreateInput = {
    id?: number
    tanggal: Date | string
    jamMasuk?: string | null
    jamKeluar?: string | null
    status: $Enums.AbsensiStatus
    userId: number
    createdAt?: Date | string
  }

  export type AbsensiUpdateInput = {
    tanggal?: DateTimeFieldUpdateOperationsInput | Date | string
    jamMasuk?: NullableStringFieldUpdateOperationsInput | string | null
    jamKeluar?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumAbsensiStatusFieldUpdateOperationsInput | $Enums.AbsensiStatus
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    user?: UserUpdateOneRequiredWithoutAbsensiNestedInput
  }

  export type AbsensiUncheckedUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number
    tanggal?: DateTimeFieldUpdateOperationsInput | Date | string
    jamMasuk?: NullableStringFieldUpdateOperationsInput | string | null
    jamKeluar?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumAbsensiStatusFieldUpdateOperationsInput | $Enums.AbsensiStatus
    userId?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AbsensiCreateManyInput = {
    id?: number
    tanggal: Date | string
    jamMasuk?: string | null
    jamKeluar?: string | null
    status: $Enums.AbsensiStatus
    userId: number
    createdAt?: Date | string
  }

  export type AbsensiUpdateManyMutationInput = {
    tanggal?: DateTimeFieldUpdateOperationsInput | Date | string
    jamMasuk?: NullableStringFieldUpdateOperationsInput | string | null
    jamKeluar?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumAbsensiStatusFieldUpdateOperationsInput | $Enums.AbsensiStatus
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AbsensiUncheckedUpdateManyInput = {
    id?: IntFieldUpdateOperationsInput | number
    tanggal?: DateTimeFieldUpdateOperationsInput | Date | string
    jamMasuk?: NullableStringFieldUpdateOperationsInput | string | null
    jamKeluar?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumAbsensiStatusFieldUpdateOperationsInput | $Enums.AbsensiStatus
    userId?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ShiftSwapRequestCreateInput = {
    status?: $Enums.SwapStatus
    createdAt?: Date | string
    pengaju: UserCreateNestedOneWithoutShiftRequestsPengajuInput
    targetUser: UserCreateNestedOneWithoutShiftRequestsTargetInput
    shift: ShiftCreateNestedOneWithoutSwapRequestsInput
  }

  export type ShiftSwapRequestUncheckedCreateInput = {
    id?: number
    pengajuId: number
    targetUserId: number
    shiftId: number
    status?: $Enums.SwapStatus
    createdAt?: Date | string
  }

  export type ShiftSwapRequestUpdateInput = {
    status?: EnumSwapStatusFieldUpdateOperationsInput | $Enums.SwapStatus
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    pengaju?: UserUpdateOneRequiredWithoutShiftRequestsPengajuNestedInput
    targetUser?: UserUpdateOneRequiredWithoutShiftRequestsTargetNestedInput
    shift?: ShiftUpdateOneRequiredWithoutSwapRequestsNestedInput
  }

  export type ShiftSwapRequestUncheckedUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number
    pengajuId?: IntFieldUpdateOperationsInput | number
    targetUserId?: IntFieldUpdateOperationsInput | number
    shiftId?: IntFieldUpdateOperationsInput | number
    status?: EnumSwapStatusFieldUpdateOperationsInput | $Enums.SwapStatus
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ShiftSwapRequestCreateManyInput = {
    id?: number
    pengajuId: number
    targetUserId: number
    shiftId: number
    status?: $Enums.SwapStatus
    createdAt?: Date | string
  }

  export type ShiftSwapRequestUpdateManyMutationInput = {
    status?: EnumSwapStatusFieldUpdateOperationsInput | $Enums.SwapStatus
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ShiftSwapRequestUncheckedUpdateManyInput = {
    id?: IntFieldUpdateOperationsInput | number
    pengajuId?: IntFieldUpdateOperationsInput | number
    targetUserId?: IntFieldUpdateOperationsInput | number
    shiftId?: IntFieldUpdateOperationsInput | number
    status?: EnumSwapStatusFieldUpdateOperationsInput | $Enums.SwapStatus
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type IntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type StringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type EnumRoleFilter<$PrismaModel = never> = {
    equals?: $Enums.Role | EnumRoleFieldRefInput<$PrismaModel>
    in?: $Enums.Role[] | ListEnumRoleFieldRefInput<$PrismaModel>
    notIn?: $Enums.Role[] | ListEnumRoleFieldRefInput<$PrismaModel>
    not?: NestedEnumRoleFilter<$PrismaModel> | $Enums.Role
  }

  export type StringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type DateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type AbsensiListRelationFilter = {
    every?: AbsensiWhereInput
    some?: AbsensiWhereInput
    none?: AbsensiWhereInput
  }

  export type ShiftListRelationFilter = {
    every?: ShiftWhereInput
    some?: ShiftWhereInput
    none?: ShiftWhereInput
  }

  export type ShiftSwapRequestListRelationFilter = {
    every?: ShiftSwapRequestWhereInput
    some?: ShiftSwapRequestWhereInput
    none?: ShiftSwapRequestWhereInput
  }

  export type SortOrderInput = {
    sort: SortOrder
    nulls?: NullsOrder
  }

  export type AbsensiOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type ShiftOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type ShiftSwapRequestOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type UserCountOrderByAggregateInput = {
    id?: SortOrder
    nama?: SortOrder
    email?: SortOrder
    password?: SortOrder
    role?: SortOrder
    nomorHP?: SortOrder
    idPegawai?: SortOrder
    unitKerja?: SortOrder
    createdAt?: SortOrder
  }

  export type UserAvgOrderByAggregateInput = {
    id?: SortOrder
  }

  export type UserMaxOrderByAggregateInput = {
    id?: SortOrder
    nama?: SortOrder
    email?: SortOrder
    password?: SortOrder
    role?: SortOrder
    nomorHP?: SortOrder
    idPegawai?: SortOrder
    unitKerja?: SortOrder
    createdAt?: SortOrder
  }

  export type UserMinOrderByAggregateInput = {
    id?: SortOrder
    nama?: SortOrder
    email?: SortOrder
    password?: SortOrder
    role?: SortOrder
    nomorHP?: SortOrder
    idPegawai?: SortOrder
    unitKerja?: SortOrder
    createdAt?: SortOrder
  }

  export type UserSumOrderByAggregateInput = {
    id?: SortOrder
  }

  export type IntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type StringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type EnumRoleWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.Role | EnumRoleFieldRefInput<$PrismaModel>
    in?: $Enums.Role[] | ListEnumRoleFieldRefInput<$PrismaModel>
    notIn?: $Enums.Role[] | ListEnumRoleFieldRefInput<$PrismaModel>
    not?: NestedEnumRoleWithAggregatesFilter<$PrismaModel> | $Enums.Role
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumRoleFilter<$PrismaModel>
    _max?: NestedEnumRoleFilter<$PrismaModel>
  }

  export type StringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type DateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type UserScalarRelationFilter = {
    is?: UserWhereInput
    isNot?: UserWhereInput
  }

  export type ShiftCountOrderByAggregateInput = {
    id?: SortOrder
    tanggal?: SortOrder
    jamMulai?: SortOrder
    jamSelesai?: SortOrder
    lokasiShift?: SortOrder
    userId?: SortOrder
    createdAt?: SortOrder
  }

  export type ShiftAvgOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
  }

  export type ShiftMaxOrderByAggregateInput = {
    id?: SortOrder
    tanggal?: SortOrder
    jamMulai?: SortOrder
    jamSelesai?: SortOrder
    lokasiShift?: SortOrder
    userId?: SortOrder
    createdAt?: SortOrder
  }

  export type ShiftMinOrderByAggregateInput = {
    id?: SortOrder
    tanggal?: SortOrder
    jamMulai?: SortOrder
    jamSelesai?: SortOrder
    lokasiShift?: SortOrder
    userId?: SortOrder
    createdAt?: SortOrder
  }

  export type ShiftSumOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
  }

  export type EnumAbsensiStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.AbsensiStatus | EnumAbsensiStatusFieldRefInput<$PrismaModel>
    in?: $Enums.AbsensiStatus[] | ListEnumAbsensiStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.AbsensiStatus[] | ListEnumAbsensiStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumAbsensiStatusFilter<$PrismaModel> | $Enums.AbsensiStatus
  }

  export type AbsensiCountOrderByAggregateInput = {
    id?: SortOrder
    tanggal?: SortOrder
    jamMasuk?: SortOrder
    jamKeluar?: SortOrder
    status?: SortOrder
    userId?: SortOrder
    createdAt?: SortOrder
  }

  export type AbsensiAvgOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
  }

  export type AbsensiMaxOrderByAggregateInput = {
    id?: SortOrder
    tanggal?: SortOrder
    jamMasuk?: SortOrder
    jamKeluar?: SortOrder
    status?: SortOrder
    userId?: SortOrder
    createdAt?: SortOrder
  }

  export type AbsensiMinOrderByAggregateInput = {
    id?: SortOrder
    tanggal?: SortOrder
    jamMasuk?: SortOrder
    jamKeluar?: SortOrder
    status?: SortOrder
    userId?: SortOrder
    createdAt?: SortOrder
  }

  export type AbsensiSumOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
  }

  export type EnumAbsensiStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.AbsensiStatus | EnumAbsensiStatusFieldRefInput<$PrismaModel>
    in?: $Enums.AbsensiStatus[] | ListEnumAbsensiStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.AbsensiStatus[] | ListEnumAbsensiStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumAbsensiStatusWithAggregatesFilter<$PrismaModel> | $Enums.AbsensiStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumAbsensiStatusFilter<$PrismaModel>
    _max?: NestedEnumAbsensiStatusFilter<$PrismaModel>
  }

  export type EnumSwapStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.SwapStatus | EnumSwapStatusFieldRefInput<$PrismaModel>
    in?: $Enums.SwapStatus[] | ListEnumSwapStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.SwapStatus[] | ListEnumSwapStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumSwapStatusFilter<$PrismaModel> | $Enums.SwapStatus
  }

  export type ShiftScalarRelationFilter = {
    is?: ShiftWhereInput
    isNot?: ShiftWhereInput
  }

  export type ShiftSwapRequestCountOrderByAggregateInput = {
    id?: SortOrder
    pengajuId?: SortOrder
    targetUserId?: SortOrder
    shiftId?: SortOrder
    status?: SortOrder
    createdAt?: SortOrder
  }

  export type ShiftSwapRequestAvgOrderByAggregateInput = {
    id?: SortOrder
    pengajuId?: SortOrder
    targetUserId?: SortOrder
    shiftId?: SortOrder
  }

  export type ShiftSwapRequestMaxOrderByAggregateInput = {
    id?: SortOrder
    pengajuId?: SortOrder
    targetUserId?: SortOrder
    shiftId?: SortOrder
    status?: SortOrder
    createdAt?: SortOrder
  }

  export type ShiftSwapRequestMinOrderByAggregateInput = {
    id?: SortOrder
    pengajuId?: SortOrder
    targetUserId?: SortOrder
    shiftId?: SortOrder
    status?: SortOrder
    createdAt?: SortOrder
  }

  export type ShiftSwapRequestSumOrderByAggregateInput = {
    id?: SortOrder
    pengajuId?: SortOrder
    targetUserId?: SortOrder
    shiftId?: SortOrder
  }

  export type EnumSwapStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.SwapStatus | EnumSwapStatusFieldRefInput<$PrismaModel>
    in?: $Enums.SwapStatus[] | ListEnumSwapStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.SwapStatus[] | ListEnumSwapStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumSwapStatusWithAggregatesFilter<$PrismaModel> | $Enums.SwapStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumSwapStatusFilter<$PrismaModel>
    _max?: NestedEnumSwapStatusFilter<$PrismaModel>
  }

  export type AbsensiCreateNestedManyWithoutUserInput = {
    create?: XOR<AbsensiCreateWithoutUserInput, AbsensiUncheckedCreateWithoutUserInput> | AbsensiCreateWithoutUserInput[] | AbsensiUncheckedCreateWithoutUserInput[]
    connectOrCreate?: AbsensiCreateOrConnectWithoutUserInput | AbsensiCreateOrConnectWithoutUserInput[]
    createMany?: AbsensiCreateManyUserInputEnvelope
    connect?: AbsensiWhereUniqueInput | AbsensiWhereUniqueInput[]
  }

  export type ShiftCreateNestedManyWithoutUserInput = {
    create?: XOR<ShiftCreateWithoutUserInput, ShiftUncheckedCreateWithoutUserInput> | ShiftCreateWithoutUserInput[] | ShiftUncheckedCreateWithoutUserInput[]
    connectOrCreate?: ShiftCreateOrConnectWithoutUserInput | ShiftCreateOrConnectWithoutUserInput[]
    createMany?: ShiftCreateManyUserInputEnvelope
    connect?: ShiftWhereUniqueInput | ShiftWhereUniqueInput[]
  }

  export type ShiftSwapRequestCreateNestedManyWithoutPengajuInput = {
    create?: XOR<ShiftSwapRequestCreateWithoutPengajuInput, ShiftSwapRequestUncheckedCreateWithoutPengajuInput> | ShiftSwapRequestCreateWithoutPengajuInput[] | ShiftSwapRequestUncheckedCreateWithoutPengajuInput[]
    connectOrCreate?: ShiftSwapRequestCreateOrConnectWithoutPengajuInput | ShiftSwapRequestCreateOrConnectWithoutPengajuInput[]
    createMany?: ShiftSwapRequestCreateManyPengajuInputEnvelope
    connect?: ShiftSwapRequestWhereUniqueInput | ShiftSwapRequestWhereUniqueInput[]
  }

  export type ShiftSwapRequestCreateNestedManyWithoutTargetUserInput = {
    create?: XOR<ShiftSwapRequestCreateWithoutTargetUserInput, ShiftSwapRequestUncheckedCreateWithoutTargetUserInput> | ShiftSwapRequestCreateWithoutTargetUserInput[] | ShiftSwapRequestUncheckedCreateWithoutTargetUserInput[]
    connectOrCreate?: ShiftSwapRequestCreateOrConnectWithoutTargetUserInput | ShiftSwapRequestCreateOrConnectWithoutTargetUserInput[]
    createMany?: ShiftSwapRequestCreateManyTargetUserInputEnvelope
    connect?: ShiftSwapRequestWhereUniqueInput | ShiftSwapRequestWhereUniqueInput[]
  }

  export type AbsensiUncheckedCreateNestedManyWithoutUserInput = {
    create?: XOR<AbsensiCreateWithoutUserInput, AbsensiUncheckedCreateWithoutUserInput> | AbsensiCreateWithoutUserInput[] | AbsensiUncheckedCreateWithoutUserInput[]
    connectOrCreate?: AbsensiCreateOrConnectWithoutUserInput | AbsensiCreateOrConnectWithoutUserInput[]
    createMany?: AbsensiCreateManyUserInputEnvelope
    connect?: AbsensiWhereUniqueInput | AbsensiWhereUniqueInput[]
  }

  export type ShiftUncheckedCreateNestedManyWithoutUserInput = {
    create?: XOR<ShiftCreateWithoutUserInput, ShiftUncheckedCreateWithoutUserInput> | ShiftCreateWithoutUserInput[] | ShiftUncheckedCreateWithoutUserInput[]
    connectOrCreate?: ShiftCreateOrConnectWithoutUserInput | ShiftCreateOrConnectWithoutUserInput[]
    createMany?: ShiftCreateManyUserInputEnvelope
    connect?: ShiftWhereUniqueInput | ShiftWhereUniqueInput[]
  }

  export type ShiftSwapRequestUncheckedCreateNestedManyWithoutPengajuInput = {
    create?: XOR<ShiftSwapRequestCreateWithoutPengajuInput, ShiftSwapRequestUncheckedCreateWithoutPengajuInput> | ShiftSwapRequestCreateWithoutPengajuInput[] | ShiftSwapRequestUncheckedCreateWithoutPengajuInput[]
    connectOrCreate?: ShiftSwapRequestCreateOrConnectWithoutPengajuInput | ShiftSwapRequestCreateOrConnectWithoutPengajuInput[]
    createMany?: ShiftSwapRequestCreateManyPengajuInputEnvelope
    connect?: ShiftSwapRequestWhereUniqueInput | ShiftSwapRequestWhereUniqueInput[]
  }

  export type ShiftSwapRequestUncheckedCreateNestedManyWithoutTargetUserInput = {
    create?: XOR<ShiftSwapRequestCreateWithoutTargetUserInput, ShiftSwapRequestUncheckedCreateWithoutTargetUserInput> | ShiftSwapRequestCreateWithoutTargetUserInput[] | ShiftSwapRequestUncheckedCreateWithoutTargetUserInput[]
    connectOrCreate?: ShiftSwapRequestCreateOrConnectWithoutTargetUserInput | ShiftSwapRequestCreateOrConnectWithoutTargetUserInput[]
    createMany?: ShiftSwapRequestCreateManyTargetUserInputEnvelope
    connect?: ShiftSwapRequestWhereUniqueInput | ShiftSwapRequestWhereUniqueInput[]
  }

  export type StringFieldUpdateOperationsInput = {
    set?: string
  }

  export type EnumRoleFieldUpdateOperationsInput = {
    set?: $Enums.Role
  }

  export type NullableStringFieldUpdateOperationsInput = {
    set?: string | null
  }

  export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string
  }

  export type AbsensiUpdateManyWithoutUserNestedInput = {
    create?: XOR<AbsensiCreateWithoutUserInput, AbsensiUncheckedCreateWithoutUserInput> | AbsensiCreateWithoutUserInput[] | AbsensiUncheckedCreateWithoutUserInput[]
    connectOrCreate?: AbsensiCreateOrConnectWithoutUserInput | AbsensiCreateOrConnectWithoutUserInput[]
    upsert?: AbsensiUpsertWithWhereUniqueWithoutUserInput | AbsensiUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: AbsensiCreateManyUserInputEnvelope
    set?: AbsensiWhereUniqueInput | AbsensiWhereUniqueInput[]
    disconnect?: AbsensiWhereUniqueInput | AbsensiWhereUniqueInput[]
    delete?: AbsensiWhereUniqueInput | AbsensiWhereUniqueInput[]
    connect?: AbsensiWhereUniqueInput | AbsensiWhereUniqueInput[]
    update?: AbsensiUpdateWithWhereUniqueWithoutUserInput | AbsensiUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: AbsensiUpdateManyWithWhereWithoutUserInput | AbsensiUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: AbsensiScalarWhereInput | AbsensiScalarWhereInput[]
  }

  export type ShiftUpdateManyWithoutUserNestedInput = {
    create?: XOR<ShiftCreateWithoutUserInput, ShiftUncheckedCreateWithoutUserInput> | ShiftCreateWithoutUserInput[] | ShiftUncheckedCreateWithoutUserInput[]
    connectOrCreate?: ShiftCreateOrConnectWithoutUserInput | ShiftCreateOrConnectWithoutUserInput[]
    upsert?: ShiftUpsertWithWhereUniqueWithoutUserInput | ShiftUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: ShiftCreateManyUserInputEnvelope
    set?: ShiftWhereUniqueInput | ShiftWhereUniqueInput[]
    disconnect?: ShiftWhereUniqueInput | ShiftWhereUniqueInput[]
    delete?: ShiftWhereUniqueInput | ShiftWhereUniqueInput[]
    connect?: ShiftWhereUniqueInput | ShiftWhereUniqueInput[]
    update?: ShiftUpdateWithWhereUniqueWithoutUserInput | ShiftUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: ShiftUpdateManyWithWhereWithoutUserInput | ShiftUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: ShiftScalarWhereInput | ShiftScalarWhereInput[]
  }

  export type ShiftSwapRequestUpdateManyWithoutPengajuNestedInput = {
    create?: XOR<ShiftSwapRequestCreateWithoutPengajuInput, ShiftSwapRequestUncheckedCreateWithoutPengajuInput> | ShiftSwapRequestCreateWithoutPengajuInput[] | ShiftSwapRequestUncheckedCreateWithoutPengajuInput[]
    connectOrCreate?: ShiftSwapRequestCreateOrConnectWithoutPengajuInput | ShiftSwapRequestCreateOrConnectWithoutPengajuInput[]
    upsert?: ShiftSwapRequestUpsertWithWhereUniqueWithoutPengajuInput | ShiftSwapRequestUpsertWithWhereUniqueWithoutPengajuInput[]
    createMany?: ShiftSwapRequestCreateManyPengajuInputEnvelope
    set?: ShiftSwapRequestWhereUniqueInput | ShiftSwapRequestWhereUniqueInput[]
    disconnect?: ShiftSwapRequestWhereUniqueInput | ShiftSwapRequestWhereUniqueInput[]
    delete?: ShiftSwapRequestWhereUniqueInput | ShiftSwapRequestWhereUniqueInput[]
    connect?: ShiftSwapRequestWhereUniqueInput | ShiftSwapRequestWhereUniqueInput[]
    update?: ShiftSwapRequestUpdateWithWhereUniqueWithoutPengajuInput | ShiftSwapRequestUpdateWithWhereUniqueWithoutPengajuInput[]
    updateMany?: ShiftSwapRequestUpdateManyWithWhereWithoutPengajuInput | ShiftSwapRequestUpdateManyWithWhereWithoutPengajuInput[]
    deleteMany?: ShiftSwapRequestScalarWhereInput | ShiftSwapRequestScalarWhereInput[]
  }

  export type ShiftSwapRequestUpdateManyWithoutTargetUserNestedInput = {
    create?: XOR<ShiftSwapRequestCreateWithoutTargetUserInput, ShiftSwapRequestUncheckedCreateWithoutTargetUserInput> | ShiftSwapRequestCreateWithoutTargetUserInput[] | ShiftSwapRequestUncheckedCreateWithoutTargetUserInput[]
    connectOrCreate?: ShiftSwapRequestCreateOrConnectWithoutTargetUserInput | ShiftSwapRequestCreateOrConnectWithoutTargetUserInput[]
    upsert?: ShiftSwapRequestUpsertWithWhereUniqueWithoutTargetUserInput | ShiftSwapRequestUpsertWithWhereUniqueWithoutTargetUserInput[]
    createMany?: ShiftSwapRequestCreateManyTargetUserInputEnvelope
    set?: ShiftSwapRequestWhereUniqueInput | ShiftSwapRequestWhereUniqueInput[]
    disconnect?: ShiftSwapRequestWhereUniqueInput | ShiftSwapRequestWhereUniqueInput[]
    delete?: ShiftSwapRequestWhereUniqueInput | ShiftSwapRequestWhereUniqueInput[]
    connect?: ShiftSwapRequestWhereUniqueInput | ShiftSwapRequestWhereUniqueInput[]
    update?: ShiftSwapRequestUpdateWithWhereUniqueWithoutTargetUserInput | ShiftSwapRequestUpdateWithWhereUniqueWithoutTargetUserInput[]
    updateMany?: ShiftSwapRequestUpdateManyWithWhereWithoutTargetUserInput | ShiftSwapRequestUpdateManyWithWhereWithoutTargetUserInput[]
    deleteMany?: ShiftSwapRequestScalarWhereInput | ShiftSwapRequestScalarWhereInput[]
  }

  export type IntFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type AbsensiUncheckedUpdateManyWithoutUserNestedInput = {
    create?: XOR<AbsensiCreateWithoutUserInput, AbsensiUncheckedCreateWithoutUserInput> | AbsensiCreateWithoutUserInput[] | AbsensiUncheckedCreateWithoutUserInput[]
    connectOrCreate?: AbsensiCreateOrConnectWithoutUserInput | AbsensiCreateOrConnectWithoutUserInput[]
    upsert?: AbsensiUpsertWithWhereUniqueWithoutUserInput | AbsensiUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: AbsensiCreateManyUserInputEnvelope
    set?: AbsensiWhereUniqueInput | AbsensiWhereUniqueInput[]
    disconnect?: AbsensiWhereUniqueInput | AbsensiWhereUniqueInput[]
    delete?: AbsensiWhereUniqueInput | AbsensiWhereUniqueInput[]
    connect?: AbsensiWhereUniqueInput | AbsensiWhereUniqueInput[]
    update?: AbsensiUpdateWithWhereUniqueWithoutUserInput | AbsensiUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: AbsensiUpdateManyWithWhereWithoutUserInput | AbsensiUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: AbsensiScalarWhereInput | AbsensiScalarWhereInput[]
  }

  export type ShiftUncheckedUpdateManyWithoutUserNestedInput = {
    create?: XOR<ShiftCreateWithoutUserInput, ShiftUncheckedCreateWithoutUserInput> | ShiftCreateWithoutUserInput[] | ShiftUncheckedCreateWithoutUserInput[]
    connectOrCreate?: ShiftCreateOrConnectWithoutUserInput | ShiftCreateOrConnectWithoutUserInput[]
    upsert?: ShiftUpsertWithWhereUniqueWithoutUserInput | ShiftUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: ShiftCreateManyUserInputEnvelope
    set?: ShiftWhereUniqueInput | ShiftWhereUniqueInput[]
    disconnect?: ShiftWhereUniqueInput | ShiftWhereUniqueInput[]
    delete?: ShiftWhereUniqueInput | ShiftWhereUniqueInput[]
    connect?: ShiftWhereUniqueInput | ShiftWhereUniqueInput[]
    update?: ShiftUpdateWithWhereUniqueWithoutUserInput | ShiftUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: ShiftUpdateManyWithWhereWithoutUserInput | ShiftUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: ShiftScalarWhereInput | ShiftScalarWhereInput[]
  }

  export type ShiftSwapRequestUncheckedUpdateManyWithoutPengajuNestedInput = {
    create?: XOR<ShiftSwapRequestCreateWithoutPengajuInput, ShiftSwapRequestUncheckedCreateWithoutPengajuInput> | ShiftSwapRequestCreateWithoutPengajuInput[] | ShiftSwapRequestUncheckedCreateWithoutPengajuInput[]
    connectOrCreate?: ShiftSwapRequestCreateOrConnectWithoutPengajuInput | ShiftSwapRequestCreateOrConnectWithoutPengajuInput[]
    upsert?: ShiftSwapRequestUpsertWithWhereUniqueWithoutPengajuInput | ShiftSwapRequestUpsertWithWhereUniqueWithoutPengajuInput[]
    createMany?: ShiftSwapRequestCreateManyPengajuInputEnvelope
    set?: ShiftSwapRequestWhereUniqueInput | ShiftSwapRequestWhereUniqueInput[]
    disconnect?: ShiftSwapRequestWhereUniqueInput | ShiftSwapRequestWhereUniqueInput[]
    delete?: ShiftSwapRequestWhereUniqueInput | ShiftSwapRequestWhereUniqueInput[]
    connect?: ShiftSwapRequestWhereUniqueInput | ShiftSwapRequestWhereUniqueInput[]
    update?: ShiftSwapRequestUpdateWithWhereUniqueWithoutPengajuInput | ShiftSwapRequestUpdateWithWhereUniqueWithoutPengajuInput[]
    updateMany?: ShiftSwapRequestUpdateManyWithWhereWithoutPengajuInput | ShiftSwapRequestUpdateManyWithWhereWithoutPengajuInput[]
    deleteMany?: ShiftSwapRequestScalarWhereInput | ShiftSwapRequestScalarWhereInput[]
  }

  export type ShiftSwapRequestUncheckedUpdateManyWithoutTargetUserNestedInput = {
    create?: XOR<ShiftSwapRequestCreateWithoutTargetUserInput, ShiftSwapRequestUncheckedCreateWithoutTargetUserInput> | ShiftSwapRequestCreateWithoutTargetUserInput[] | ShiftSwapRequestUncheckedCreateWithoutTargetUserInput[]
    connectOrCreate?: ShiftSwapRequestCreateOrConnectWithoutTargetUserInput | ShiftSwapRequestCreateOrConnectWithoutTargetUserInput[]
    upsert?: ShiftSwapRequestUpsertWithWhereUniqueWithoutTargetUserInput | ShiftSwapRequestUpsertWithWhereUniqueWithoutTargetUserInput[]
    createMany?: ShiftSwapRequestCreateManyTargetUserInputEnvelope
    set?: ShiftSwapRequestWhereUniqueInput | ShiftSwapRequestWhereUniqueInput[]
    disconnect?: ShiftSwapRequestWhereUniqueInput | ShiftSwapRequestWhereUniqueInput[]
    delete?: ShiftSwapRequestWhereUniqueInput | ShiftSwapRequestWhereUniqueInput[]
    connect?: ShiftSwapRequestWhereUniqueInput | ShiftSwapRequestWhereUniqueInput[]
    update?: ShiftSwapRequestUpdateWithWhereUniqueWithoutTargetUserInput | ShiftSwapRequestUpdateWithWhereUniqueWithoutTargetUserInput[]
    updateMany?: ShiftSwapRequestUpdateManyWithWhereWithoutTargetUserInput | ShiftSwapRequestUpdateManyWithWhereWithoutTargetUserInput[]
    deleteMany?: ShiftSwapRequestScalarWhereInput | ShiftSwapRequestScalarWhereInput[]
  }

  export type UserCreateNestedOneWithoutShiftInput = {
    create?: XOR<UserCreateWithoutShiftInput, UserUncheckedCreateWithoutShiftInput>
    connectOrCreate?: UserCreateOrConnectWithoutShiftInput
    connect?: UserWhereUniqueInput
  }

  export type ShiftSwapRequestCreateNestedManyWithoutShiftInput = {
    create?: XOR<ShiftSwapRequestCreateWithoutShiftInput, ShiftSwapRequestUncheckedCreateWithoutShiftInput> | ShiftSwapRequestCreateWithoutShiftInput[] | ShiftSwapRequestUncheckedCreateWithoutShiftInput[]
    connectOrCreate?: ShiftSwapRequestCreateOrConnectWithoutShiftInput | ShiftSwapRequestCreateOrConnectWithoutShiftInput[]
    createMany?: ShiftSwapRequestCreateManyShiftInputEnvelope
    connect?: ShiftSwapRequestWhereUniqueInput | ShiftSwapRequestWhereUniqueInput[]
  }

  export type ShiftSwapRequestUncheckedCreateNestedManyWithoutShiftInput = {
    create?: XOR<ShiftSwapRequestCreateWithoutShiftInput, ShiftSwapRequestUncheckedCreateWithoutShiftInput> | ShiftSwapRequestCreateWithoutShiftInput[] | ShiftSwapRequestUncheckedCreateWithoutShiftInput[]
    connectOrCreate?: ShiftSwapRequestCreateOrConnectWithoutShiftInput | ShiftSwapRequestCreateOrConnectWithoutShiftInput[]
    createMany?: ShiftSwapRequestCreateManyShiftInputEnvelope
    connect?: ShiftSwapRequestWhereUniqueInput | ShiftSwapRequestWhereUniqueInput[]
  }

  export type UserUpdateOneRequiredWithoutShiftNestedInput = {
    create?: XOR<UserCreateWithoutShiftInput, UserUncheckedCreateWithoutShiftInput>
    connectOrCreate?: UserCreateOrConnectWithoutShiftInput
    upsert?: UserUpsertWithoutShiftInput
    connect?: UserWhereUniqueInput
    update?: XOR<XOR<UserUpdateToOneWithWhereWithoutShiftInput, UserUpdateWithoutShiftInput>, UserUncheckedUpdateWithoutShiftInput>
  }

  export type ShiftSwapRequestUpdateManyWithoutShiftNestedInput = {
    create?: XOR<ShiftSwapRequestCreateWithoutShiftInput, ShiftSwapRequestUncheckedCreateWithoutShiftInput> | ShiftSwapRequestCreateWithoutShiftInput[] | ShiftSwapRequestUncheckedCreateWithoutShiftInput[]
    connectOrCreate?: ShiftSwapRequestCreateOrConnectWithoutShiftInput | ShiftSwapRequestCreateOrConnectWithoutShiftInput[]
    upsert?: ShiftSwapRequestUpsertWithWhereUniqueWithoutShiftInput | ShiftSwapRequestUpsertWithWhereUniqueWithoutShiftInput[]
    createMany?: ShiftSwapRequestCreateManyShiftInputEnvelope
    set?: ShiftSwapRequestWhereUniqueInput | ShiftSwapRequestWhereUniqueInput[]
    disconnect?: ShiftSwapRequestWhereUniqueInput | ShiftSwapRequestWhereUniqueInput[]
    delete?: ShiftSwapRequestWhereUniqueInput | ShiftSwapRequestWhereUniqueInput[]
    connect?: ShiftSwapRequestWhereUniqueInput | ShiftSwapRequestWhereUniqueInput[]
    update?: ShiftSwapRequestUpdateWithWhereUniqueWithoutShiftInput | ShiftSwapRequestUpdateWithWhereUniqueWithoutShiftInput[]
    updateMany?: ShiftSwapRequestUpdateManyWithWhereWithoutShiftInput | ShiftSwapRequestUpdateManyWithWhereWithoutShiftInput[]
    deleteMany?: ShiftSwapRequestScalarWhereInput | ShiftSwapRequestScalarWhereInput[]
  }

  export type ShiftSwapRequestUncheckedUpdateManyWithoutShiftNestedInput = {
    create?: XOR<ShiftSwapRequestCreateWithoutShiftInput, ShiftSwapRequestUncheckedCreateWithoutShiftInput> | ShiftSwapRequestCreateWithoutShiftInput[] | ShiftSwapRequestUncheckedCreateWithoutShiftInput[]
    connectOrCreate?: ShiftSwapRequestCreateOrConnectWithoutShiftInput | ShiftSwapRequestCreateOrConnectWithoutShiftInput[]
    upsert?: ShiftSwapRequestUpsertWithWhereUniqueWithoutShiftInput | ShiftSwapRequestUpsertWithWhereUniqueWithoutShiftInput[]
    createMany?: ShiftSwapRequestCreateManyShiftInputEnvelope
    set?: ShiftSwapRequestWhereUniqueInput | ShiftSwapRequestWhereUniqueInput[]
    disconnect?: ShiftSwapRequestWhereUniqueInput | ShiftSwapRequestWhereUniqueInput[]
    delete?: ShiftSwapRequestWhereUniqueInput | ShiftSwapRequestWhereUniqueInput[]
    connect?: ShiftSwapRequestWhereUniqueInput | ShiftSwapRequestWhereUniqueInput[]
    update?: ShiftSwapRequestUpdateWithWhereUniqueWithoutShiftInput | ShiftSwapRequestUpdateWithWhereUniqueWithoutShiftInput[]
    updateMany?: ShiftSwapRequestUpdateManyWithWhereWithoutShiftInput | ShiftSwapRequestUpdateManyWithWhereWithoutShiftInput[]
    deleteMany?: ShiftSwapRequestScalarWhereInput | ShiftSwapRequestScalarWhereInput[]
  }

  export type UserCreateNestedOneWithoutAbsensiInput = {
    create?: XOR<UserCreateWithoutAbsensiInput, UserUncheckedCreateWithoutAbsensiInput>
    connectOrCreate?: UserCreateOrConnectWithoutAbsensiInput
    connect?: UserWhereUniqueInput
  }

  export type EnumAbsensiStatusFieldUpdateOperationsInput = {
    set?: $Enums.AbsensiStatus
  }

  export type UserUpdateOneRequiredWithoutAbsensiNestedInput = {
    create?: XOR<UserCreateWithoutAbsensiInput, UserUncheckedCreateWithoutAbsensiInput>
    connectOrCreate?: UserCreateOrConnectWithoutAbsensiInput
    upsert?: UserUpsertWithoutAbsensiInput
    connect?: UserWhereUniqueInput
    update?: XOR<XOR<UserUpdateToOneWithWhereWithoutAbsensiInput, UserUpdateWithoutAbsensiInput>, UserUncheckedUpdateWithoutAbsensiInput>
  }

  export type UserCreateNestedOneWithoutShiftRequestsPengajuInput = {
    create?: XOR<UserCreateWithoutShiftRequestsPengajuInput, UserUncheckedCreateWithoutShiftRequestsPengajuInput>
    connectOrCreate?: UserCreateOrConnectWithoutShiftRequestsPengajuInput
    connect?: UserWhereUniqueInput
  }

  export type UserCreateNestedOneWithoutShiftRequestsTargetInput = {
    create?: XOR<UserCreateWithoutShiftRequestsTargetInput, UserUncheckedCreateWithoutShiftRequestsTargetInput>
    connectOrCreate?: UserCreateOrConnectWithoutShiftRequestsTargetInput
    connect?: UserWhereUniqueInput
  }

  export type ShiftCreateNestedOneWithoutSwapRequestsInput = {
    create?: XOR<ShiftCreateWithoutSwapRequestsInput, ShiftUncheckedCreateWithoutSwapRequestsInput>
    connectOrCreate?: ShiftCreateOrConnectWithoutSwapRequestsInput
    connect?: ShiftWhereUniqueInput
  }

  export type EnumSwapStatusFieldUpdateOperationsInput = {
    set?: $Enums.SwapStatus
  }

  export type UserUpdateOneRequiredWithoutShiftRequestsPengajuNestedInput = {
    create?: XOR<UserCreateWithoutShiftRequestsPengajuInput, UserUncheckedCreateWithoutShiftRequestsPengajuInput>
    connectOrCreate?: UserCreateOrConnectWithoutShiftRequestsPengajuInput
    upsert?: UserUpsertWithoutShiftRequestsPengajuInput
    connect?: UserWhereUniqueInput
    update?: XOR<XOR<UserUpdateToOneWithWhereWithoutShiftRequestsPengajuInput, UserUpdateWithoutShiftRequestsPengajuInput>, UserUncheckedUpdateWithoutShiftRequestsPengajuInput>
  }

  export type UserUpdateOneRequiredWithoutShiftRequestsTargetNestedInput = {
    create?: XOR<UserCreateWithoutShiftRequestsTargetInput, UserUncheckedCreateWithoutShiftRequestsTargetInput>
    connectOrCreate?: UserCreateOrConnectWithoutShiftRequestsTargetInput
    upsert?: UserUpsertWithoutShiftRequestsTargetInput
    connect?: UserWhereUniqueInput
    update?: XOR<XOR<UserUpdateToOneWithWhereWithoutShiftRequestsTargetInput, UserUpdateWithoutShiftRequestsTargetInput>, UserUncheckedUpdateWithoutShiftRequestsTargetInput>
  }

  export type ShiftUpdateOneRequiredWithoutSwapRequestsNestedInput = {
    create?: XOR<ShiftCreateWithoutSwapRequestsInput, ShiftUncheckedCreateWithoutSwapRequestsInput>
    connectOrCreate?: ShiftCreateOrConnectWithoutSwapRequestsInput
    upsert?: ShiftUpsertWithoutSwapRequestsInput
    connect?: ShiftWhereUniqueInput
    update?: XOR<XOR<ShiftUpdateToOneWithWhereWithoutSwapRequestsInput, ShiftUpdateWithoutSwapRequestsInput>, ShiftUncheckedUpdateWithoutSwapRequestsInput>
  }

  export type NestedIntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type NestedStringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type NestedEnumRoleFilter<$PrismaModel = never> = {
    equals?: $Enums.Role | EnumRoleFieldRefInput<$PrismaModel>
    in?: $Enums.Role[] | ListEnumRoleFieldRefInput<$PrismaModel>
    notIn?: $Enums.Role[] | ListEnumRoleFieldRefInput<$PrismaModel>
    not?: NestedEnumRoleFilter<$PrismaModel> | $Enums.Role
  }

  export type NestedStringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type NestedDateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type NestedIntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type NestedFloatFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatFilter<$PrismaModel> | number
  }

  export type NestedStringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type NestedEnumRoleWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.Role | EnumRoleFieldRefInput<$PrismaModel>
    in?: $Enums.Role[] | ListEnumRoleFieldRefInput<$PrismaModel>
    notIn?: $Enums.Role[] | ListEnumRoleFieldRefInput<$PrismaModel>
    not?: NestedEnumRoleWithAggregatesFilter<$PrismaModel> | $Enums.Role
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumRoleFilter<$PrismaModel>
    _max?: NestedEnumRoleFilter<$PrismaModel>
  }

  export type NestedStringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type NestedIntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }

  export type NestedDateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type NestedEnumAbsensiStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.AbsensiStatus | EnumAbsensiStatusFieldRefInput<$PrismaModel>
    in?: $Enums.AbsensiStatus[] | ListEnumAbsensiStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.AbsensiStatus[] | ListEnumAbsensiStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumAbsensiStatusFilter<$PrismaModel> | $Enums.AbsensiStatus
  }

  export type NestedEnumAbsensiStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.AbsensiStatus | EnumAbsensiStatusFieldRefInput<$PrismaModel>
    in?: $Enums.AbsensiStatus[] | ListEnumAbsensiStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.AbsensiStatus[] | ListEnumAbsensiStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumAbsensiStatusWithAggregatesFilter<$PrismaModel> | $Enums.AbsensiStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumAbsensiStatusFilter<$PrismaModel>
    _max?: NestedEnumAbsensiStatusFilter<$PrismaModel>
  }

  export type NestedEnumSwapStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.SwapStatus | EnumSwapStatusFieldRefInput<$PrismaModel>
    in?: $Enums.SwapStatus[] | ListEnumSwapStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.SwapStatus[] | ListEnumSwapStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumSwapStatusFilter<$PrismaModel> | $Enums.SwapStatus
  }

  export type NestedEnumSwapStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.SwapStatus | EnumSwapStatusFieldRefInput<$PrismaModel>
    in?: $Enums.SwapStatus[] | ListEnumSwapStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.SwapStatus[] | ListEnumSwapStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumSwapStatusWithAggregatesFilter<$PrismaModel> | $Enums.SwapStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumSwapStatusFilter<$PrismaModel>
    _max?: NestedEnumSwapStatusFilter<$PrismaModel>
  }

  export type AbsensiCreateWithoutUserInput = {
    tanggal: Date | string
    jamMasuk?: string | null
    jamKeluar?: string | null
    status: $Enums.AbsensiStatus
    createdAt?: Date | string
  }

  export type AbsensiUncheckedCreateWithoutUserInput = {
    id?: number
    tanggal: Date | string
    jamMasuk?: string | null
    jamKeluar?: string | null
    status: $Enums.AbsensiStatus
    createdAt?: Date | string
  }

  export type AbsensiCreateOrConnectWithoutUserInput = {
    where: AbsensiWhereUniqueInput
    create: XOR<AbsensiCreateWithoutUserInput, AbsensiUncheckedCreateWithoutUserInput>
  }

  export type AbsensiCreateManyUserInputEnvelope = {
    data: AbsensiCreateManyUserInput | AbsensiCreateManyUserInput[]
    skipDuplicates?: boolean
  }

  export type ShiftCreateWithoutUserInput = {
    tanggal: Date | string
    jamMulai: string
    jamSelesai: string
    lokasiShift: string
    createdAt?: Date | string
    swapRequests?: ShiftSwapRequestCreateNestedManyWithoutShiftInput
  }

  export type ShiftUncheckedCreateWithoutUserInput = {
    id?: number
    tanggal: Date | string
    jamMulai: string
    jamSelesai: string
    lokasiShift: string
    createdAt?: Date | string
    swapRequests?: ShiftSwapRequestUncheckedCreateNestedManyWithoutShiftInput
  }

  export type ShiftCreateOrConnectWithoutUserInput = {
    where: ShiftWhereUniqueInput
    create: XOR<ShiftCreateWithoutUserInput, ShiftUncheckedCreateWithoutUserInput>
  }

  export type ShiftCreateManyUserInputEnvelope = {
    data: ShiftCreateManyUserInput | ShiftCreateManyUserInput[]
    skipDuplicates?: boolean
  }

  export type ShiftSwapRequestCreateWithoutPengajuInput = {
    status?: $Enums.SwapStatus
    createdAt?: Date | string
    targetUser: UserCreateNestedOneWithoutShiftRequestsTargetInput
    shift: ShiftCreateNestedOneWithoutSwapRequestsInput
  }

  export type ShiftSwapRequestUncheckedCreateWithoutPengajuInput = {
    id?: number
    targetUserId: number
    shiftId: number
    status?: $Enums.SwapStatus
    createdAt?: Date | string
  }

  export type ShiftSwapRequestCreateOrConnectWithoutPengajuInput = {
    where: ShiftSwapRequestWhereUniqueInput
    create: XOR<ShiftSwapRequestCreateWithoutPengajuInput, ShiftSwapRequestUncheckedCreateWithoutPengajuInput>
  }

  export type ShiftSwapRequestCreateManyPengajuInputEnvelope = {
    data: ShiftSwapRequestCreateManyPengajuInput | ShiftSwapRequestCreateManyPengajuInput[]
    skipDuplicates?: boolean
  }

  export type ShiftSwapRequestCreateWithoutTargetUserInput = {
    status?: $Enums.SwapStatus
    createdAt?: Date | string
    pengaju: UserCreateNestedOneWithoutShiftRequestsPengajuInput
    shift: ShiftCreateNestedOneWithoutSwapRequestsInput
  }

  export type ShiftSwapRequestUncheckedCreateWithoutTargetUserInput = {
    id?: number
    pengajuId: number
    shiftId: number
    status?: $Enums.SwapStatus
    createdAt?: Date | string
  }

  export type ShiftSwapRequestCreateOrConnectWithoutTargetUserInput = {
    where: ShiftSwapRequestWhereUniqueInput
    create: XOR<ShiftSwapRequestCreateWithoutTargetUserInput, ShiftSwapRequestUncheckedCreateWithoutTargetUserInput>
  }

  export type ShiftSwapRequestCreateManyTargetUserInputEnvelope = {
    data: ShiftSwapRequestCreateManyTargetUserInput | ShiftSwapRequestCreateManyTargetUserInput[]
    skipDuplicates?: boolean
  }

  export type AbsensiUpsertWithWhereUniqueWithoutUserInput = {
    where: AbsensiWhereUniqueInput
    update: XOR<AbsensiUpdateWithoutUserInput, AbsensiUncheckedUpdateWithoutUserInput>
    create: XOR<AbsensiCreateWithoutUserInput, AbsensiUncheckedCreateWithoutUserInput>
  }

  export type AbsensiUpdateWithWhereUniqueWithoutUserInput = {
    where: AbsensiWhereUniqueInput
    data: XOR<AbsensiUpdateWithoutUserInput, AbsensiUncheckedUpdateWithoutUserInput>
  }

  export type AbsensiUpdateManyWithWhereWithoutUserInput = {
    where: AbsensiScalarWhereInput
    data: XOR<AbsensiUpdateManyMutationInput, AbsensiUncheckedUpdateManyWithoutUserInput>
  }

  export type AbsensiScalarWhereInput = {
    AND?: AbsensiScalarWhereInput | AbsensiScalarWhereInput[]
    OR?: AbsensiScalarWhereInput[]
    NOT?: AbsensiScalarWhereInput | AbsensiScalarWhereInput[]
    id?: IntFilter<"Absensi"> | number
    tanggal?: DateTimeFilter<"Absensi"> | Date | string
    jamMasuk?: StringNullableFilter<"Absensi"> | string | null
    jamKeluar?: StringNullableFilter<"Absensi"> | string | null
    status?: EnumAbsensiStatusFilter<"Absensi"> | $Enums.AbsensiStatus
    userId?: IntFilter<"Absensi"> | number
    createdAt?: DateTimeFilter<"Absensi"> | Date | string
  }

  export type ShiftUpsertWithWhereUniqueWithoutUserInput = {
    where: ShiftWhereUniqueInput
    update: XOR<ShiftUpdateWithoutUserInput, ShiftUncheckedUpdateWithoutUserInput>
    create: XOR<ShiftCreateWithoutUserInput, ShiftUncheckedCreateWithoutUserInput>
  }

  export type ShiftUpdateWithWhereUniqueWithoutUserInput = {
    where: ShiftWhereUniqueInput
    data: XOR<ShiftUpdateWithoutUserInput, ShiftUncheckedUpdateWithoutUserInput>
  }

  export type ShiftUpdateManyWithWhereWithoutUserInput = {
    where: ShiftScalarWhereInput
    data: XOR<ShiftUpdateManyMutationInput, ShiftUncheckedUpdateManyWithoutUserInput>
  }

  export type ShiftScalarWhereInput = {
    AND?: ShiftScalarWhereInput | ShiftScalarWhereInput[]
    OR?: ShiftScalarWhereInput[]
    NOT?: ShiftScalarWhereInput | ShiftScalarWhereInput[]
    id?: IntFilter<"Shift"> | number
    tanggal?: DateTimeFilter<"Shift"> | Date | string
    jamMulai?: StringFilter<"Shift"> | string
    jamSelesai?: StringFilter<"Shift"> | string
    lokasiShift?: StringFilter<"Shift"> | string
    userId?: IntFilter<"Shift"> | number
    createdAt?: DateTimeFilter<"Shift"> | Date | string
  }

  export type ShiftSwapRequestUpsertWithWhereUniqueWithoutPengajuInput = {
    where: ShiftSwapRequestWhereUniqueInput
    update: XOR<ShiftSwapRequestUpdateWithoutPengajuInput, ShiftSwapRequestUncheckedUpdateWithoutPengajuInput>
    create: XOR<ShiftSwapRequestCreateWithoutPengajuInput, ShiftSwapRequestUncheckedCreateWithoutPengajuInput>
  }

  export type ShiftSwapRequestUpdateWithWhereUniqueWithoutPengajuInput = {
    where: ShiftSwapRequestWhereUniqueInput
    data: XOR<ShiftSwapRequestUpdateWithoutPengajuInput, ShiftSwapRequestUncheckedUpdateWithoutPengajuInput>
  }

  export type ShiftSwapRequestUpdateManyWithWhereWithoutPengajuInput = {
    where: ShiftSwapRequestScalarWhereInput
    data: XOR<ShiftSwapRequestUpdateManyMutationInput, ShiftSwapRequestUncheckedUpdateManyWithoutPengajuInput>
  }

  export type ShiftSwapRequestScalarWhereInput = {
    AND?: ShiftSwapRequestScalarWhereInput | ShiftSwapRequestScalarWhereInput[]
    OR?: ShiftSwapRequestScalarWhereInput[]
    NOT?: ShiftSwapRequestScalarWhereInput | ShiftSwapRequestScalarWhereInput[]
    id?: IntFilter<"ShiftSwapRequest"> | number
    pengajuId?: IntFilter<"ShiftSwapRequest"> | number
    targetUserId?: IntFilter<"ShiftSwapRequest"> | number
    shiftId?: IntFilter<"ShiftSwapRequest"> | number
    status?: EnumSwapStatusFilter<"ShiftSwapRequest"> | $Enums.SwapStatus
    createdAt?: DateTimeFilter<"ShiftSwapRequest"> | Date | string
  }

  export type ShiftSwapRequestUpsertWithWhereUniqueWithoutTargetUserInput = {
    where: ShiftSwapRequestWhereUniqueInput
    update: XOR<ShiftSwapRequestUpdateWithoutTargetUserInput, ShiftSwapRequestUncheckedUpdateWithoutTargetUserInput>
    create: XOR<ShiftSwapRequestCreateWithoutTargetUserInput, ShiftSwapRequestUncheckedCreateWithoutTargetUserInput>
  }

  export type ShiftSwapRequestUpdateWithWhereUniqueWithoutTargetUserInput = {
    where: ShiftSwapRequestWhereUniqueInput
    data: XOR<ShiftSwapRequestUpdateWithoutTargetUserInput, ShiftSwapRequestUncheckedUpdateWithoutTargetUserInput>
  }

  export type ShiftSwapRequestUpdateManyWithWhereWithoutTargetUserInput = {
    where: ShiftSwapRequestScalarWhereInput
    data: XOR<ShiftSwapRequestUpdateManyMutationInput, ShiftSwapRequestUncheckedUpdateManyWithoutTargetUserInput>
  }

  export type UserCreateWithoutShiftInput = {
    nama: string
    email: string
    password: string
    role: $Enums.Role
    nomorHP?: string | null
    idPegawai: string
    unitKerja?: string | null
    createdAt?: Date | string
    absensi?: AbsensiCreateNestedManyWithoutUserInput
    shiftRequestsPengaju?: ShiftSwapRequestCreateNestedManyWithoutPengajuInput
    shiftRequestsTarget?: ShiftSwapRequestCreateNestedManyWithoutTargetUserInput
  }

  export type UserUncheckedCreateWithoutShiftInput = {
    id?: number
    nama: string
    email: string
    password: string
    role: $Enums.Role
    nomorHP?: string | null
    idPegawai: string
    unitKerja?: string | null
    createdAt?: Date | string
    absensi?: AbsensiUncheckedCreateNestedManyWithoutUserInput
    shiftRequestsPengaju?: ShiftSwapRequestUncheckedCreateNestedManyWithoutPengajuInput
    shiftRequestsTarget?: ShiftSwapRequestUncheckedCreateNestedManyWithoutTargetUserInput
  }

  export type UserCreateOrConnectWithoutShiftInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutShiftInput, UserUncheckedCreateWithoutShiftInput>
  }

  export type ShiftSwapRequestCreateWithoutShiftInput = {
    status?: $Enums.SwapStatus
    createdAt?: Date | string
    pengaju: UserCreateNestedOneWithoutShiftRequestsPengajuInput
    targetUser: UserCreateNestedOneWithoutShiftRequestsTargetInput
  }

  export type ShiftSwapRequestUncheckedCreateWithoutShiftInput = {
    id?: number
    pengajuId: number
    targetUserId: number
    status?: $Enums.SwapStatus
    createdAt?: Date | string
  }

  export type ShiftSwapRequestCreateOrConnectWithoutShiftInput = {
    where: ShiftSwapRequestWhereUniqueInput
    create: XOR<ShiftSwapRequestCreateWithoutShiftInput, ShiftSwapRequestUncheckedCreateWithoutShiftInput>
  }

  export type ShiftSwapRequestCreateManyShiftInputEnvelope = {
    data: ShiftSwapRequestCreateManyShiftInput | ShiftSwapRequestCreateManyShiftInput[]
    skipDuplicates?: boolean
  }

  export type UserUpsertWithoutShiftInput = {
    update: XOR<UserUpdateWithoutShiftInput, UserUncheckedUpdateWithoutShiftInput>
    create: XOR<UserCreateWithoutShiftInput, UserUncheckedCreateWithoutShiftInput>
    where?: UserWhereInput
  }

  export type UserUpdateToOneWithWhereWithoutShiftInput = {
    where?: UserWhereInput
    data: XOR<UserUpdateWithoutShiftInput, UserUncheckedUpdateWithoutShiftInput>
  }

  export type UserUpdateWithoutShiftInput = {
    nama?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    role?: EnumRoleFieldUpdateOperationsInput | $Enums.Role
    nomorHP?: NullableStringFieldUpdateOperationsInput | string | null
    idPegawai?: StringFieldUpdateOperationsInput | string
    unitKerja?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    absensi?: AbsensiUpdateManyWithoutUserNestedInput
    shiftRequestsPengaju?: ShiftSwapRequestUpdateManyWithoutPengajuNestedInput
    shiftRequestsTarget?: ShiftSwapRequestUpdateManyWithoutTargetUserNestedInput
  }

  export type UserUncheckedUpdateWithoutShiftInput = {
    id?: IntFieldUpdateOperationsInput | number
    nama?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    role?: EnumRoleFieldUpdateOperationsInput | $Enums.Role
    nomorHP?: NullableStringFieldUpdateOperationsInput | string | null
    idPegawai?: StringFieldUpdateOperationsInput | string
    unitKerja?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    absensi?: AbsensiUncheckedUpdateManyWithoutUserNestedInput
    shiftRequestsPengaju?: ShiftSwapRequestUncheckedUpdateManyWithoutPengajuNestedInput
    shiftRequestsTarget?: ShiftSwapRequestUncheckedUpdateManyWithoutTargetUserNestedInput
  }

  export type ShiftSwapRequestUpsertWithWhereUniqueWithoutShiftInput = {
    where: ShiftSwapRequestWhereUniqueInput
    update: XOR<ShiftSwapRequestUpdateWithoutShiftInput, ShiftSwapRequestUncheckedUpdateWithoutShiftInput>
    create: XOR<ShiftSwapRequestCreateWithoutShiftInput, ShiftSwapRequestUncheckedCreateWithoutShiftInput>
  }

  export type ShiftSwapRequestUpdateWithWhereUniqueWithoutShiftInput = {
    where: ShiftSwapRequestWhereUniqueInput
    data: XOR<ShiftSwapRequestUpdateWithoutShiftInput, ShiftSwapRequestUncheckedUpdateWithoutShiftInput>
  }

  export type ShiftSwapRequestUpdateManyWithWhereWithoutShiftInput = {
    where: ShiftSwapRequestScalarWhereInput
    data: XOR<ShiftSwapRequestUpdateManyMutationInput, ShiftSwapRequestUncheckedUpdateManyWithoutShiftInput>
  }

  export type UserCreateWithoutAbsensiInput = {
    nama: string
    email: string
    password: string
    role: $Enums.Role
    nomorHP?: string | null
    idPegawai: string
    unitKerja?: string | null
    createdAt?: Date | string
    shift?: ShiftCreateNestedManyWithoutUserInput
    shiftRequestsPengaju?: ShiftSwapRequestCreateNestedManyWithoutPengajuInput
    shiftRequestsTarget?: ShiftSwapRequestCreateNestedManyWithoutTargetUserInput
  }

  export type UserUncheckedCreateWithoutAbsensiInput = {
    id?: number
    nama: string
    email: string
    password: string
    role: $Enums.Role
    nomorHP?: string | null
    idPegawai: string
    unitKerja?: string | null
    createdAt?: Date | string
    shift?: ShiftUncheckedCreateNestedManyWithoutUserInput
    shiftRequestsPengaju?: ShiftSwapRequestUncheckedCreateNestedManyWithoutPengajuInput
    shiftRequestsTarget?: ShiftSwapRequestUncheckedCreateNestedManyWithoutTargetUserInput
  }

  export type UserCreateOrConnectWithoutAbsensiInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutAbsensiInput, UserUncheckedCreateWithoutAbsensiInput>
  }

  export type UserUpsertWithoutAbsensiInput = {
    update: XOR<UserUpdateWithoutAbsensiInput, UserUncheckedUpdateWithoutAbsensiInput>
    create: XOR<UserCreateWithoutAbsensiInput, UserUncheckedCreateWithoutAbsensiInput>
    where?: UserWhereInput
  }

  export type UserUpdateToOneWithWhereWithoutAbsensiInput = {
    where?: UserWhereInput
    data: XOR<UserUpdateWithoutAbsensiInput, UserUncheckedUpdateWithoutAbsensiInput>
  }

  export type UserUpdateWithoutAbsensiInput = {
    nama?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    role?: EnumRoleFieldUpdateOperationsInput | $Enums.Role
    nomorHP?: NullableStringFieldUpdateOperationsInput | string | null
    idPegawai?: StringFieldUpdateOperationsInput | string
    unitKerja?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    shift?: ShiftUpdateManyWithoutUserNestedInput
    shiftRequestsPengaju?: ShiftSwapRequestUpdateManyWithoutPengajuNestedInput
    shiftRequestsTarget?: ShiftSwapRequestUpdateManyWithoutTargetUserNestedInput
  }

  export type UserUncheckedUpdateWithoutAbsensiInput = {
    id?: IntFieldUpdateOperationsInput | number
    nama?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    role?: EnumRoleFieldUpdateOperationsInput | $Enums.Role
    nomorHP?: NullableStringFieldUpdateOperationsInput | string | null
    idPegawai?: StringFieldUpdateOperationsInput | string
    unitKerja?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    shift?: ShiftUncheckedUpdateManyWithoutUserNestedInput
    shiftRequestsPengaju?: ShiftSwapRequestUncheckedUpdateManyWithoutPengajuNestedInput
    shiftRequestsTarget?: ShiftSwapRequestUncheckedUpdateManyWithoutTargetUserNestedInput
  }

  export type UserCreateWithoutShiftRequestsPengajuInput = {
    nama: string
    email: string
    password: string
    role: $Enums.Role
    nomorHP?: string | null
    idPegawai: string
    unitKerja?: string | null
    createdAt?: Date | string
    absensi?: AbsensiCreateNestedManyWithoutUserInput
    shift?: ShiftCreateNestedManyWithoutUserInput
    shiftRequestsTarget?: ShiftSwapRequestCreateNestedManyWithoutTargetUserInput
  }

  export type UserUncheckedCreateWithoutShiftRequestsPengajuInput = {
    id?: number
    nama: string
    email: string
    password: string
    role: $Enums.Role
    nomorHP?: string | null
    idPegawai: string
    unitKerja?: string | null
    createdAt?: Date | string
    absensi?: AbsensiUncheckedCreateNestedManyWithoutUserInput
    shift?: ShiftUncheckedCreateNestedManyWithoutUserInput
    shiftRequestsTarget?: ShiftSwapRequestUncheckedCreateNestedManyWithoutTargetUserInput
  }

  export type UserCreateOrConnectWithoutShiftRequestsPengajuInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutShiftRequestsPengajuInput, UserUncheckedCreateWithoutShiftRequestsPengajuInput>
  }

  export type UserCreateWithoutShiftRequestsTargetInput = {
    nama: string
    email: string
    password: string
    role: $Enums.Role
    nomorHP?: string | null
    idPegawai: string
    unitKerja?: string | null
    createdAt?: Date | string
    absensi?: AbsensiCreateNestedManyWithoutUserInput
    shift?: ShiftCreateNestedManyWithoutUserInput
    shiftRequestsPengaju?: ShiftSwapRequestCreateNestedManyWithoutPengajuInput
  }

  export type UserUncheckedCreateWithoutShiftRequestsTargetInput = {
    id?: number
    nama: string
    email: string
    password: string
    role: $Enums.Role
    nomorHP?: string | null
    idPegawai: string
    unitKerja?: string | null
    createdAt?: Date | string
    absensi?: AbsensiUncheckedCreateNestedManyWithoutUserInput
    shift?: ShiftUncheckedCreateNestedManyWithoutUserInput
    shiftRequestsPengaju?: ShiftSwapRequestUncheckedCreateNestedManyWithoutPengajuInput
  }

  export type UserCreateOrConnectWithoutShiftRequestsTargetInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutShiftRequestsTargetInput, UserUncheckedCreateWithoutShiftRequestsTargetInput>
  }

  export type ShiftCreateWithoutSwapRequestsInput = {
    tanggal: Date | string
    jamMulai: string
    jamSelesai: string
    lokasiShift: string
    createdAt?: Date | string
    user: UserCreateNestedOneWithoutShiftInput
  }

  export type ShiftUncheckedCreateWithoutSwapRequestsInput = {
    id?: number
    tanggal: Date | string
    jamMulai: string
    jamSelesai: string
    lokasiShift: string
    userId: number
    createdAt?: Date | string
  }

  export type ShiftCreateOrConnectWithoutSwapRequestsInput = {
    where: ShiftWhereUniqueInput
    create: XOR<ShiftCreateWithoutSwapRequestsInput, ShiftUncheckedCreateWithoutSwapRequestsInput>
  }

  export type UserUpsertWithoutShiftRequestsPengajuInput = {
    update: XOR<UserUpdateWithoutShiftRequestsPengajuInput, UserUncheckedUpdateWithoutShiftRequestsPengajuInput>
    create: XOR<UserCreateWithoutShiftRequestsPengajuInput, UserUncheckedCreateWithoutShiftRequestsPengajuInput>
    where?: UserWhereInput
  }

  export type UserUpdateToOneWithWhereWithoutShiftRequestsPengajuInput = {
    where?: UserWhereInput
    data: XOR<UserUpdateWithoutShiftRequestsPengajuInput, UserUncheckedUpdateWithoutShiftRequestsPengajuInput>
  }

  export type UserUpdateWithoutShiftRequestsPengajuInput = {
    nama?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    role?: EnumRoleFieldUpdateOperationsInput | $Enums.Role
    nomorHP?: NullableStringFieldUpdateOperationsInput | string | null
    idPegawai?: StringFieldUpdateOperationsInput | string
    unitKerja?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    absensi?: AbsensiUpdateManyWithoutUserNestedInput
    shift?: ShiftUpdateManyWithoutUserNestedInput
    shiftRequestsTarget?: ShiftSwapRequestUpdateManyWithoutTargetUserNestedInput
  }

  export type UserUncheckedUpdateWithoutShiftRequestsPengajuInput = {
    id?: IntFieldUpdateOperationsInput | number
    nama?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    role?: EnumRoleFieldUpdateOperationsInput | $Enums.Role
    nomorHP?: NullableStringFieldUpdateOperationsInput | string | null
    idPegawai?: StringFieldUpdateOperationsInput | string
    unitKerja?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    absensi?: AbsensiUncheckedUpdateManyWithoutUserNestedInput
    shift?: ShiftUncheckedUpdateManyWithoutUserNestedInput
    shiftRequestsTarget?: ShiftSwapRequestUncheckedUpdateManyWithoutTargetUserNestedInput
  }

  export type UserUpsertWithoutShiftRequestsTargetInput = {
    update: XOR<UserUpdateWithoutShiftRequestsTargetInput, UserUncheckedUpdateWithoutShiftRequestsTargetInput>
    create: XOR<UserCreateWithoutShiftRequestsTargetInput, UserUncheckedCreateWithoutShiftRequestsTargetInput>
    where?: UserWhereInput
  }

  export type UserUpdateToOneWithWhereWithoutShiftRequestsTargetInput = {
    where?: UserWhereInput
    data: XOR<UserUpdateWithoutShiftRequestsTargetInput, UserUncheckedUpdateWithoutShiftRequestsTargetInput>
  }

  export type UserUpdateWithoutShiftRequestsTargetInput = {
    nama?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    role?: EnumRoleFieldUpdateOperationsInput | $Enums.Role
    nomorHP?: NullableStringFieldUpdateOperationsInput | string | null
    idPegawai?: StringFieldUpdateOperationsInput | string
    unitKerja?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    absensi?: AbsensiUpdateManyWithoutUserNestedInput
    shift?: ShiftUpdateManyWithoutUserNestedInput
    shiftRequestsPengaju?: ShiftSwapRequestUpdateManyWithoutPengajuNestedInput
  }

  export type UserUncheckedUpdateWithoutShiftRequestsTargetInput = {
    id?: IntFieldUpdateOperationsInput | number
    nama?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    role?: EnumRoleFieldUpdateOperationsInput | $Enums.Role
    nomorHP?: NullableStringFieldUpdateOperationsInput | string | null
    idPegawai?: StringFieldUpdateOperationsInput | string
    unitKerja?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    absensi?: AbsensiUncheckedUpdateManyWithoutUserNestedInput
    shift?: ShiftUncheckedUpdateManyWithoutUserNestedInput
    shiftRequestsPengaju?: ShiftSwapRequestUncheckedUpdateManyWithoutPengajuNestedInput
  }

  export type ShiftUpsertWithoutSwapRequestsInput = {
    update: XOR<ShiftUpdateWithoutSwapRequestsInput, ShiftUncheckedUpdateWithoutSwapRequestsInput>
    create: XOR<ShiftCreateWithoutSwapRequestsInput, ShiftUncheckedCreateWithoutSwapRequestsInput>
    where?: ShiftWhereInput
  }

  export type ShiftUpdateToOneWithWhereWithoutSwapRequestsInput = {
    where?: ShiftWhereInput
    data: XOR<ShiftUpdateWithoutSwapRequestsInput, ShiftUncheckedUpdateWithoutSwapRequestsInput>
  }

  export type ShiftUpdateWithoutSwapRequestsInput = {
    tanggal?: DateTimeFieldUpdateOperationsInput | Date | string
    jamMulai?: StringFieldUpdateOperationsInput | string
    jamSelesai?: StringFieldUpdateOperationsInput | string
    lokasiShift?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    user?: UserUpdateOneRequiredWithoutShiftNestedInput
  }

  export type ShiftUncheckedUpdateWithoutSwapRequestsInput = {
    id?: IntFieldUpdateOperationsInput | number
    tanggal?: DateTimeFieldUpdateOperationsInput | Date | string
    jamMulai?: StringFieldUpdateOperationsInput | string
    jamSelesai?: StringFieldUpdateOperationsInput | string
    lokasiShift?: StringFieldUpdateOperationsInput | string
    userId?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AbsensiCreateManyUserInput = {
    id?: number
    tanggal: Date | string
    jamMasuk?: string | null
    jamKeluar?: string | null
    status: $Enums.AbsensiStatus
    createdAt?: Date | string
  }

  export type ShiftCreateManyUserInput = {
    id?: number
    tanggal: Date | string
    jamMulai: string
    jamSelesai: string
    lokasiShift: string
    createdAt?: Date | string
  }

  export type ShiftSwapRequestCreateManyPengajuInput = {
    id?: number
    targetUserId: number
    shiftId: number
    status?: $Enums.SwapStatus
    createdAt?: Date | string
  }

  export type ShiftSwapRequestCreateManyTargetUserInput = {
    id?: number
    pengajuId: number
    shiftId: number
    status?: $Enums.SwapStatus
    createdAt?: Date | string
  }

  export type AbsensiUpdateWithoutUserInput = {
    tanggal?: DateTimeFieldUpdateOperationsInput | Date | string
    jamMasuk?: NullableStringFieldUpdateOperationsInput | string | null
    jamKeluar?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumAbsensiStatusFieldUpdateOperationsInput | $Enums.AbsensiStatus
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AbsensiUncheckedUpdateWithoutUserInput = {
    id?: IntFieldUpdateOperationsInput | number
    tanggal?: DateTimeFieldUpdateOperationsInput | Date | string
    jamMasuk?: NullableStringFieldUpdateOperationsInput | string | null
    jamKeluar?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumAbsensiStatusFieldUpdateOperationsInput | $Enums.AbsensiStatus
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AbsensiUncheckedUpdateManyWithoutUserInput = {
    id?: IntFieldUpdateOperationsInput | number
    tanggal?: DateTimeFieldUpdateOperationsInput | Date | string
    jamMasuk?: NullableStringFieldUpdateOperationsInput | string | null
    jamKeluar?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumAbsensiStatusFieldUpdateOperationsInput | $Enums.AbsensiStatus
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ShiftUpdateWithoutUserInput = {
    tanggal?: DateTimeFieldUpdateOperationsInput | Date | string
    jamMulai?: StringFieldUpdateOperationsInput | string
    jamSelesai?: StringFieldUpdateOperationsInput | string
    lokasiShift?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    swapRequests?: ShiftSwapRequestUpdateManyWithoutShiftNestedInput
  }

  export type ShiftUncheckedUpdateWithoutUserInput = {
    id?: IntFieldUpdateOperationsInput | number
    tanggal?: DateTimeFieldUpdateOperationsInput | Date | string
    jamMulai?: StringFieldUpdateOperationsInput | string
    jamSelesai?: StringFieldUpdateOperationsInput | string
    lokasiShift?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    swapRequests?: ShiftSwapRequestUncheckedUpdateManyWithoutShiftNestedInput
  }

  export type ShiftUncheckedUpdateManyWithoutUserInput = {
    id?: IntFieldUpdateOperationsInput | number
    tanggal?: DateTimeFieldUpdateOperationsInput | Date | string
    jamMulai?: StringFieldUpdateOperationsInput | string
    jamSelesai?: StringFieldUpdateOperationsInput | string
    lokasiShift?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ShiftSwapRequestUpdateWithoutPengajuInput = {
    status?: EnumSwapStatusFieldUpdateOperationsInput | $Enums.SwapStatus
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    targetUser?: UserUpdateOneRequiredWithoutShiftRequestsTargetNestedInput
    shift?: ShiftUpdateOneRequiredWithoutSwapRequestsNestedInput
  }

  export type ShiftSwapRequestUncheckedUpdateWithoutPengajuInput = {
    id?: IntFieldUpdateOperationsInput | number
    targetUserId?: IntFieldUpdateOperationsInput | number
    shiftId?: IntFieldUpdateOperationsInput | number
    status?: EnumSwapStatusFieldUpdateOperationsInput | $Enums.SwapStatus
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ShiftSwapRequestUncheckedUpdateManyWithoutPengajuInput = {
    id?: IntFieldUpdateOperationsInput | number
    targetUserId?: IntFieldUpdateOperationsInput | number
    shiftId?: IntFieldUpdateOperationsInput | number
    status?: EnumSwapStatusFieldUpdateOperationsInput | $Enums.SwapStatus
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ShiftSwapRequestUpdateWithoutTargetUserInput = {
    status?: EnumSwapStatusFieldUpdateOperationsInput | $Enums.SwapStatus
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    pengaju?: UserUpdateOneRequiredWithoutShiftRequestsPengajuNestedInput
    shift?: ShiftUpdateOneRequiredWithoutSwapRequestsNestedInput
  }

  export type ShiftSwapRequestUncheckedUpdateWithoutTargetUserInput = {
    id?: IntFieldUpdateOperationsInput | number
    pengajuId?: IntFieldUpdateOperationsInput | number
    shiftId?: IntFieldUpdateOperationsInput | number
    status?: EnumSwapStatusFieldUpdateOperationsInput | $Enums.SwapStatus
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ShiftSwapRequestUncheckedUpdateManyWithoutTargetUserInput = {
    id?: IntFieldUpdateOperationsInput | number
    pengajuId?: IntFieldUpdateOperationsInput | number
    shiftId?: IntFieldUpdateOperationsInput | number
    status?: EnumSwapStatusFieldUpdateOperationsInput | $Enums.SwapStatus
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ShiftSwapRequestCreateManyShiftInput = {
    id?: number
    pengajuId: number
    targetUserId: number
    status?: $Enums.SwapStatus
    createdAt?: Date | string
  }

  export type ShiftSwapRequestUpdateWithoutShiftInput = {
    status?: EnumSwapStatusFieldUpdateOperationsInput | $Enums.SwapStatus
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    pengaju?: UserUpdateOneRequiredWithoutShiftRequestsPengajuNestedInput
    targetUser?: UserUpdateOneRequiredWithoutShiftRequestsTargetNestedInput
  }

  export type ShiftSwapRequestUncheckedUpdateWithoutShiftInput = {
    id?: IntFieldUpdateOperationsInput | number
    pengajuId?: IntFieldUpdateOperationsInput | number
    targetUserId?: IntFieldUpdateOperationsInput | number
    status?: EnumSwapStatusFieldUpdateOperationsInput | $Enums.SwapStatus
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ShiftSwapRequestUncheckedUpdateManyWithoutShiftInput = {
    id?: IntFieldUpdateOperationsInput | number
    pengajuId?: IntFieldUpdateOperationsInput | number
    targetUserId?: IntFieldUpdateOperationsInput | number
    status?: EnumSwapStatusFieldUpdateOperationsInput | $Enums.SwapStatus
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }



  /**
   * Batch Payload for updateMany & deleteMany & createMany
   */

  export type BatchPayload = {
    count: number
  }

  /**
   * DMMF
   */
  export const dmmf: runtime.BaseDMMF
}