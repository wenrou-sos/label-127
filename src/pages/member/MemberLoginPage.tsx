import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Smartphone, ShieldCheck, ArrowLeft, KeyRound } from 'lucide-react';
import { BrandMark } from '@/components/layout/BrandMark';
import { Button, Input, useToast } from '@/components/ui';
import { useAuthStore } from '@/lib/auth';
import { mockService } from '@/lib/mock/service';
import { maskPhone } from '@/lib/format';

const DEMO_PHONE = '13812345678';
const COUNTDOWN = 60;

export default function MemberLoginPage() {
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);
  const { toast } = useToast();

  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [sending, setSending] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);

  async function handleSendCode() {
    setError(null);
    if (!/^\d{11}$/.test(phone.trim())) {
      setError('请输入正确的 11 位手机号');
      return;
    }
    setSending(true);
    const res = await mockService.sendSmsCode(phone.trim());
    setSending(false);
    if (res.ok) {
      setCountdown(COUNTDOWN);
      timerRef.current = setInterval(() => {
        setCountdown((c) => (c <= 1 ? 0 : c - 1));
      }, 1000);
      toast({ tone: 'info', title: '验证码已发送', desc: `已发送至 ${maskPhone(phone)} · 演示码 1234` });
    }
  }

  async function handleLogin() {
    setError(null);
    if (!/^\d{11}$/.test(phone.trim())) {
      setError('请输入正确的 11 位手机号');
      return;
    }
    if (code.length !== 4) {
      setError('请输入 4 位验证码');
      return;
    }
    setLoading(true);
    const res = await mockService.loginWithCode(phone.trim(), code);
    setLoading(false);
    if (res) {
      login(res.member, res.token);
      toast({ tone: 'success', title: '登录成功', desc: `欢迎回来，${res.member.name}` });
      navigate('/member', { replace: true });
    } else {
      setError('手机号或验证码错误，请重试');
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-forest-800 via-forest-900 to-ink-900 p-4">
      <div className="pointer-events-none fixed inset-0 bg-grain opacity-40" />
      <div className="pointer-events-none absolute -left-20 top-10 h-72 w-72 rounded-full bg-forest-500/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-16 bottom-0 h-72 w-72 rounded-full bg-gold-500/10 blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 240, damping: 24 }}
        className="relative w-full max-w-md"
      >
        <div className="mb-6 flex flex-col items-center text-center">
          <BrandMark size="lg" />
          <h1 className="mt-6 font-serif text-2xl font-semibold text-cream-50">会员中心登录</h1>
          <p className="mt-1.5 text-sm text-cream-100/60">
            登录后查询消费流水、余额变动并导出账单
          </p>
        </div>

        <div className="surface-card p-6">
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink-700">手机号</label>
              <Input
                icon={<Smartphone className="h-4 w-4" />}
                inputMode="numeric"
                maxLength={11}
                placeholder="请输入会员手机号"
                value={phone}
                invalid={!!error && !/验证码/.test(error)}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink-700">短信验证码</label>
              <div className="flex gap-2">
                <Input
                  icon={<KeyRound className="h-4 w-4" />}
                  inputMode="numeric"
                  maxLength={4}
                  placeholder="4 位验证码"
                  value={code}
                  invalid={!!error && /验证码/.test(error)}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                  onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                  className="tnum tracking-[0.4em]"
                />
                <Button
                  variant="secondary"
                  onClick={handleSendCode}
                  loading={sending}
                  disabled={countdown > 0}
                  className="shrink-0 px-3"
                >
                  {countdown > 0 ? `${countdown}s` : '获取验证码'}
                </Button>
              </div>
            </div>

            {error && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-lg bg-brick-50 px-3 py-2 text-xs font-medium text-brick-600 ring-1 ring-inset ring-brick-200"
              >
                {error}
              </motion.p>
            )}

            <Button className="w-full" size="lg" loading={loading} onClick={handleLogin}>
              <ShieldCheck className="h-4 w-4" />
              安全登录
            </Button>

            <div className="rounded-xl bg-forest-50 px-3.5 py-2.5 text-xs text-ink-500 ring-1 ring-inset ring-forest-100">
              <p className="font-medium text-forest-700">演示账号</p>
              <button
                onClick={() => {
                  setPhone(DEMO_PHONE);
                  setCode('1234');
                }}
                className="btn-focus mt-0.5 block text-left"
              >
                手机号 {DEMO_PHONE} · 验证码 1234（点击填入）
              </button>
            </div>
          </div>
        </div>

        <div className="mt-5 flex justify-center">
          <Link
            to="/cashier"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-cream-100/60 transition hover:text-cream-50"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            返回收银端工作台
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
