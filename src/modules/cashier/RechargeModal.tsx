import { useState } from 'react';
import { Wallet, AlertCircle } from 'lucide-react';
import { Modal, Button, Input, Field } from '@/components/ui';
import { formatCurrency } from '@/lib/format';

const MIN_AMOUNT = 10;
const MAX_AMOUNT = 10000;
const QUICK_AMOUNTS = [100, 200, 500, 1000];

export function RechargeModal({
  open,
  onClose,
  memberName,
  currentBalance,
  onConfirm,
}: {
  open: boolean;
  onClose: () => void;
  memberName: string;
  currentBalance: number;
  onConfirm: (amount: number, note: string) => Promise<void>;
}) {
  const [amountStr, setAmountStr] = useState('');
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleAmountChange(val: string) {
    setError(null);
    const cleaned = val.replace(/[^\d]/g, '');
    setAmountStr(cleaned);
  }

  function selectQuick(n: number) {
    setError(null);
    setAmountStr(String(n));
  }

  function validate(): number | null {
    if (!amountStr) {
      setError('请输入充值金额');
      return null;
    }
    const n = parseInt(amountStr, 10);
    if (isNaN(n) || n !== parseFloat(amountStr)) {
      setError('充值金额必须为正整数');
      return null;
    }
    if (n < MIN_AMOUNT) {
      setError(`最低充值金额为 ${MIN_AMOUNT} 元`);
      return null;
    }
    if (n > MAX_AMOUNT) {
      setError(`单次充值不超过 ${MAX_AMOUNT} 元`);
      return null;
    }
    return n;
  }

  async function handleSubmit() {
    const amount = validate();
    if (amount === null) return;
    setSubmitting(true);
    try {
      await onConfirm(amount, note.trim() || '收银台手动充值');
      resetAndClose();
    } finally {
      setSubmitting(false);
    }
  }

  function resetAndClose() {
    setAmountStr('');
    setNote('');
    setError(null);
    onClose();
  }

  const amount = amountStr ? parseInt(amountStr, 10) : 0;
  const previewBalance = !isNaN(amount) && amount >= MIN_AMOUNT ? currentBalance + amount : null;

  return (
    <Modal
      open={open}
      onClose={resetAndClose}
      size="sm"
      icon={<Wallet className="h-5 w-5" />}
      title="会员充值"
      subtitle={`${memberName} · 当前余额 ${formatCurrency(currentBalance)}`}
      footer={
        <>
          <Button variant="secondary" onClick={resetAndClose} disabled={submitting}>
            取消
          </Button>
          <Button variant="gold" onClick={handleSubmit} loading={submitting} disabled={!amountStr}>
            确认充值
          </Button>
        </>
      }
    >
      <div className="space-y-5">
        <Field label="充值金额" hint={`正整数，${MIN_AMOUNT} ~ ${MAX_AMOUNT} 元`}>
          <div className="relative">
            <Input
              type="text"
              inputMode="numeric"
              placeholder={`输入充值金额（${MIN_AMOUNT}~${MAX_AMOUNT}）`}
              value={amountStr}
              onChange={(e) => handleAmountChange(e.target.value)}
              invalid={!!error}
              icon={<span className="text-sm font-semibold text-ink-400">¥</span>}
            />
          </div>
          {error && (
            <p className="mt-1.5 flex items-center gap-1 text-xs text-brick-500">
              <AlertCircle className="h-3.5 w-3.5" />
              {error}
            </p>
          )}
        </Field>

        <div>
          <p className="mb-2 text-xs text-ink-400">快捷金额</p>
          <div className="grid grid-cols-4 gap-2">
            {QUICK_AMOUNTS.map((n) => (
              <button
                key={n}
                onClick={() => selectQuick(n)}
                className={`tnum rounded-xl border px-3 py-2 text-sm font-medium transition ${
                  amountStr === String(n)
                    ? 'border-gold-400 bg-gold-50 text-gold-700'
                    : 'border-forest-150 bg-white text-ink-600 hover:border-forest-300 hover:bg-forest-50'
                }`}
              >
                ¥{n}
              </button>
            ))}
          </div>
        </div>

        <Field label="备注" hint="可选，填写充值原因或优惠信息">
          <Input
            type="text"
            placeholder="如：新会员首充、满赠活动等"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            maxLength={50}
          />
        </Field>

        {previewBalance !== null && (
          <div className="rounded-xl border border-forest-100 bg-forest-50/60 p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-ink-500">充值后余额</span>
              <span className="tnum font-serif text-xl font-semibold text-forest-700">
                ¥{previewBalance.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="mt-2 flex items-center justify-between text-xs text-ink-400">
              <span>当前 {formatCurrency(currentBalance)}</span>
              <span>+ ¥{amount.toLocaleString()}</span>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
