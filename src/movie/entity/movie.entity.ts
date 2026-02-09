import { Exclude, Expose, Transform } from "class-transformer";

// @Exclude() // 외부에 노출되지 않게하기 위함
export class Movie {
    @Expose() // class 전체를 Exclude로 노출되지 않게 하고 Expose하면 보여도 되느 값을 보이게끔 함
    id: number;
    @Expose()
    title: string;

    @Transform(
        ({value}) => value.toString().toUpperCase()
    )
    genre: string;
}