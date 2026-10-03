'use client';

import { useState } from 'react';
import { Mail, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Reveal } from '@/components/motion';
import { cn } from '@/lib/utils';

/**
 * Đây là form local: backend chưa có endpoint subscribe nên không giả lập
 * POST. Người dùng đăng ký được xác nhận ngay trên UI, và nếu sau này có API
 * thì chỗ gọi request duy nhất là `handleSubmit`.
 */
export function Newsletter() {
  const [email, setEmail] = useState('');
  const [done, setDone] = useState(false);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!email.trim()) return;
    setDone(true);
    setEmail('');
  }

  return (
    <section className="border-b">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl bg-foreground px-6 py-12 text-background sm:px-12 lg:py-16">
            <div
              aria-hidden
              className="pointer-events-none absolute -right-20 -top-20 size-72 rounded-full bg-background/5 blur-2xl"
            />
            <div className="relative mx-auto max-w-2xl text-center">
              <h2 className="text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">
                Nhận thông tin bộ sưu tập mới trước tiên
              </h2>
              <p className="mt-3 text-background/70">
                Một email mỗi khi có mẫu mới lên kệ. Không quảng cáo, không
                spam — bạn có thể hủy bất kỳ lúc nào.
              </p>

              {done ? (
                <p className="mt-8 inline-flex items-center gap-2 rounded-full bg-background/10 px-5 py-3 text-sm font-medium">
                  <Check className="size-4" />
                  Đã đăng ký. Cảm ơn bạn!
                </p>
              ) : (
                <form
                  onSubmit={handleSubmit}
                  className="mx-auto mt-8 flex max-w-md flex-col gap-3 sm:flex-row"
                >
                  <label htmlFor="newsletter-email" className="sr-only">
                    Email của bạn
                  </label>
                  <div className="relative flex-1">
                    <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="newsletter-email"
                      type="email"
                      required
                      placeholder="email của bạn"
                      value={email}
                      onChange={(event) => {
                        setEmail(event.target.value);
                        setDone(false);
                      }}
                      className={cn(
                        'h-11 bg-background pl-9 text-foreground placeholder:text-muted-foreground',
                      )}
                    />
                  </div>
                  <Button
                    type="submit"
                    size="lg"
                    className="h-11 bg-background text-foreground hover:bg-background/90"
                  >
                    Đăng ký
                  </Button>
                </form>
              )}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}