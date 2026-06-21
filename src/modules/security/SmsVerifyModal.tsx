import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Smartphone, RefreshCw, CheckCircle2, ShieldAlert } from 'lucide-react';
import { Modal, Button, Input } from '@/components/ui';
import { mockService } from '@/lib/mock/service';
import { useToast } from '@/components/ui';
import { maskPhone, formatCurrency, formatRelativeDate } from '@/lib/format';
import type { AnomalyAlert } from '@/lib/types';

type Step = 'input' | 'verifying' | 'success';
const COUNTDOWN = 60;

export function SmsVerifyModal({
  open,
  onClose,
  alert,
  onVerified,
}: {
  open: boolean;
  onClose: () => void;
  alert: AnomalyAlert | null;
  onVerified: (alertId: string) => void;
}) {
  const [code, setCode] = useState('');
  const [step, setStep] = useState<Step>('input');
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(COUNTDOWN);
  const [resending, setResending] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (!open || !alert) return;
    setCode('');
    setError(null);
    setStep('input');
    setCountdown(COUNTDOWN);
    timerRef.current = setInterval(() => {
      setCountdown((c) => (c <= 1 ? 0 : c - 1));
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [open, alert]);

  async function handleVerify() {
    if (!alert) return;
    if (code.length !== 4) {
      setError('请输入 4 位验证码');
      return;
    }
    setStep('verifying');
    const res = await mockService.verifySmsCode(alert.id, code);
    if (res.ok) {
      setStep('success');
      if (timerRef.current) clearInterval(timerRef.current);
      setTimeout(() => {
        onVerified(alert.id);
        onClose();
      }, 1400);
    } else {
      setStep('input');
      setError('验证码错误，请重新输入');
    }
  }

  async function handleResend() {
    if (!alert || countdown > 0) return;
    setResending(true);
    await mockService.triggerSmsVerify(alert.memberId, alert.id);
    setResending(false);
    setCountdown(COUNTDOWN);
    timerRef.current = setInterval(() => {
      setCountdown((c) => (c <= 1 ? 0 : c - 1));
    }, 1000);
    toast({ tone: 'info', title: '验证码已重新发送', desc: '演示验证码：1234' });
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="sm"
      dismissable={step !== 'verifying'}
      icon={step === 'success' ? <CheckCircle2 className="h-5 w-5" /> : <ShieldAlert className="h-5 w-5" />}
      title={step === 'success' ? '验证通过' : '异常消费短信验证'}
      subtitle={step === 'success' ? '消费拦截已解除' : '为保障会员资金安全，请完成身份核验'}
    >
      {alert && (
        <div className="space-y-4">
          {step !== 'success' && (
            <>
              <div className="rounded-xl border border-brick-200 bg-brick-50/60 p-3.5">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-brick-600">
                  <ShieldAlert className="h-3.5 w-3.5" />
                  触发原因
                </div>
                <p className="mt-1.5 text-sm text-ink-700">{alert.reason}</p>
                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-ink-400">
                  <span>会员 {alert.memberName}（{maskPhone(alert.memberPhone)}）</span>
                  <span>日期 {formatRelativeDate(alert.date)}</span>
                  <span>合计 {formatCurrency(alert.totalAmount)}</span>
                </div>
              </div>

              <div>
                <div className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-ink-700">
                  <Smartphone className="h-4 w-4 text-forest-600" />
                  验证码已发送至 {maskPhone(alert.memberPhone)}
                </div>
                <Input
                  inputMode="numeric"
                  maxLength={4}
                  placeholder="请输入 4 位短信验证码"
                  value={code}
                  invalid={!!error}
                  onChange={(e) => {
                    setCode(e.target.value.replace(/\D/g, ''));
                    setError(null);
                  }}
                  onKeyDown={(e) => e.key === 'Enter' && step === 'input' && handleVerify()}
                  className="tnum tracking-[0.5em]"
                />
                <div className="mt-1.5 flex items-center justify-between">
                  {error ? (
                    <motion.p
                      initial={{ x: -4 }}
                      animate={{ x: 0 }}
                      className="text-xs font-medium text-brick-600"
                    >
                      {error}
                    </motion.p>
                  ) : (
                    <p className="text-xs text-ink-400">演示验证码：1234</p>
                  )}
                  <button
                    onClick={handleResend}
                    disabled={countdown > 0 || resending}
                    className="btn-focus inline-flex items-center gap-1 text-xs font-medium text-forest-600 disabled:text-ink-300"
                  >
                    <RefreshCw className={`h-3 w-3 ${resending ? 'animate-spin' : ''}`} />
                    {countdown > 0 ? `${countdown}s 后可重发` : '重新发送'}
                  </button>
                </div>
              </div>

              <Button className="w-full" size="lg" loading={step === 'verifying'} onClick={handleVerify}>
                验证并解除拦截
              </Button>
            </>
          )}

          {step === 'success' && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex flex-col items-center gap-3 py-6 text-center"
            >
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 260, damping: 16, delay: 0.05 }}
                className="flex h-16 w-16 items-center justify-center rounded-full bg-forest-50 text-forest-600"
              >
                <ShieldCheck className="h-8 w-8" />
              </motion.span>
              <div>
                <p className="font-serif text-lg font-semibold text-ink-800">身份核验成功</p>
                <p className="mt-1 text-xs text-ink-400">
                  {alert.memberName} 的异常消费已确认本人操作，拦截已解除
                </p>
              </div>
            </motion.div>
          )}
        </div>
      )}
    </Modal>
  );
}
