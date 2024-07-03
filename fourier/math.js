// 复数
class Complex {
    constructor(real, imag) {
        this.real = real;
        this.imag = imag;
    }

    // 复数加法
    add(other) {
        return new Complex(this.real + other.real, this.imag + other.imag);
    }
    // 复数减法
    sub(other) {
        return new Complex(this.real - other.real, this.imag - other.imag);
    }
    // 复数乘法
    mul(other) {
        return new Complex(this.real * other.real - this.imag * other.imag, this.real * other.imag + this.imag * other.real);
    }

    // 复指数转复数，z=r*(e^jθ)=r*cos(θ)+r*jsin(θ) 其中θ为复数
    r_exp(r, theta) {
        return new Complex(r * Math.cos(theta), r * Math.sin(theta));
    }
}


// 傅里叶级数
class FourierSeries {
    constructor() {
    }

    get_k(circleCounts) {
        let k = [];
        for (let i = 0; i < circleCounts; i++) {
            k.push((1 + i >> 1) * (i & 1 ? -1 : 1));
        }
        return k;
    }

    get_ak(xn, circleCounts, L = 1) {
        let xn_len = xn.length;
        let Ak = [];
        let K = this.get_k(circleCounts);
        for (let k = 0; k < circleCounts; k++) {
            Ak[k] = new Complex(0, 0);
            for (let n = 0; n < xn_len; n++) {
                Ak[k] = Ak[k].add(xn[n].mul(new Complex().r_exp(1, -2 * Math.PI * K[k] * n / xn_len)));
            }
            Ak[k] = Ak[k].mul(new Complex(-L / xn_len, 0));
        }
        return Ak;
    }
}