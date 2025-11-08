| نوع توکن (پیشوند) | مثال تعریف در `@theme`                         | کلاس‌هایی که خودکار ساخته می‌شوند                                                | توضیح                                            |
| ----------------- | ---------------------------------------------- | -------------------------------------------------------------------------------- | ------------------------------------------------ |
| `--color-*`       | `--color-primary: #42b983;`                    | `text-primary`, `bg-primary`, `border-primary`, `fill-primary`, `stroke-primary` | برای تمام رنگ‌ها (متن، پس‌زمینه، کادر، SVG و...) |
| `--font-*`        | `--font-sans: "Inter", sans-serif;`            | `font-sans`                                                                      | خانواده فونت‌ها                                  |
| `--font-weight-*` | `--font-weight-bold: 700;`                     | `font-bold`                                                                      | ضخامت فونت‌ها                                    |
| `--line-*`        | `--line-relaxed: 1.6;`                         | `leading-relaxed`                                                                | ارتفاع خط (line-height)                          |
| `--radius-*`      | `--radius-lg: 0.5rem;`                         | `rounded-lg`                                                                     | گوشه‌های گرد (border-radius)                     |
| `--shadow-*`      | `--shadow-md: 0 4px 6px rgba(0,0,0,0.1);`      | `shadow-md`                                                                      | سایه‌ها                                          |
| `--spacing-*`     | `--spacing-18: 4.5rem;`                        | `p-18`, `m-18`, `gap-18`, `space-x-18`, `space-y-18`                             | فاصله‌ها (margin, padding, gap و ...)            |
| `--z-*`           | `--z-modal: 1050;`                             | `z-modal`                                                                        | مقدار z-index برای لایه‌ها                       |
| `--opacity-*`     | `--opacity-80: 0.8;`                           | `opacity-80`                                                                     | شفافیت (opacity)                                 |
| `--scale-*`       | `--scale-110: 1.1;`                            | `scale-110`                                                                      | مقیاس در transform                               |
| `--rotate-*`      | `--rotate-45: 45deg;`                          | `rotate-45`                                                                      | چرخش عناصر                                       |
| `--translate-x-*` | `--translate-x-4: 1rem;`                       | `translate-x-4`                                                                  | انتقال (transform translate)                     |
| `--translate-y-*` | `--translate-y-4: 1rem;`                       | `translate-y-4`                                                                  | انتقال عمودی                                     |
| `--blur-*`        | `--blur-md: 8px;`                              | `blur-md`                                                                        | فیلتر تاری (blur)                                |
| `--duration-*`    | `--duration-300: 300ms;`                       | `duration-300`                                                                   | مدت زمان transition                              |
| `--ease-*`        | `--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);` | `ease-in-out`                                                                    | تابع easing برای transition                      |
| `--container-*`   | `--container-lg: 1024px;`                      | `container` (با max-width خاص)                                                   | اندازه کانتینرها                                 |
| `--border-*`      | `--border-2: 2px;`                             | `border-2`                                                                       | ضخامت border                                     |
| `--inset-*`       | `--inset-4: 1rem;`                             | `top-4`, `bottom-4`, `left-4`, `right-4`                                         | فاصله موقعیت‌ها                                  |
| `--max-w-*`       | `--max-w-screen-lg: 1024px;`                   | `max-w-screen-lg`                                                                | عرض حداکثر                                       |
| `--min-w-*`       | `--min-w-16: 4rem;`                            | `min-w-16`                                                                       | عرض حداقل                                        |
| `--max-h-*`       | `--max-h-96: 24rem;`                           | `max-h-96`                                                                       | ارتفاع حداکثر                                    |
| `--min-h-*`       | `--min-h-32: 8rem;`                            | `min-h-32`                                                                       | ارتفاع حداقل                                     |
| `--transition-*`  | `--transition-fast: all 150ms ease-in-out;`    | `transition-fast`                                                                | تعریف انتقال‌های سریع‌تر یا کندتر                |
| `--ring-*`        | `--ring-primary: #42b983;`                     | `ring-primary`, `focus:ring-primary`                                             | رنگ حلقه‌ی focus                                 |
| `--accent-*`      | `--accent-blue: #3b82f6;`                      | `accent-blue`                                                                    | رنگ accent در inputهای نوع checkbox/radio        |




| نوع توکن       | نام در `@theme`                                       | کلاس‌هایی که می‌سازد                                                              | توضیح کاربرد                  |
| -------------- | ----------------------------------------------------- | --------------------------------------------------------------------------------- | ----------------------------- |
| 🎨 رنگ‌ها      | `--color-primary: #3b82f6;`                           | `text-primary`, `bg-primary`, `border-primary`, `outline-primary`, `ring-primary` | برای رنگ اصلی برند یا دکمه‌ها |
| 🎨 رنگ دوم     | `--color-secondary: #f97316;`                         | `text-secondary`, `bg-secondary`, `border-secondary`, `outline-secondary`         | برای رنگ مکمل                 |
| 🎨 رنگ تیره‌تر | `--color-primary-dark: #1e40af;`                      | `hover:bg-primary-dark`, `text-primary-dark`, `border-primary-dark`               | برای hover یا حالت فعال       |
| 🔤 فونت        | `--font-sans: "Inter", sans-serif;`                   | `font-sans`                                                                       | برای تنظیم فونت پیش‌فرض       |
| 📏 Radius      | `--radius-lg: 0.5rem;`                                | `rounded-lg`                                                                      | تعیین شعاع گوشه‌ها            |
| ⚫ خاکستری      | `--color-gray-100: #f3f4f6;`                          | `bg-gray-100`, `text-gray-100`, `border-gray-100`                                 | رنگ پس‌زمینه یا متن خنثی      |
| ⚪ سفید و سیاه  | `--color-white: #ffffff;` / `--color-black: #000000;` | `bg-white`, `text-black`, `border-black`, ...                                     | رنگ‌های پایه‌ی عمومی          |
