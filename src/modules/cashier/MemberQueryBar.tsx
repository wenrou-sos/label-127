import { useState } from 'react';
import { motion } from 'framer-motion';
import { Phone, CreditCard, Search, Nfc, ChevronRight } from 'lucide-react';
import { Button, Input, SectionTag } from '@/components/ui';
import { cn } from '@/lib/utils';
import { mockService } from '@/lib/mock/service';
import type { Member } from '@/lib/types';

type Mode = 'phone' | 'card';

const DEMO_PHONE = '13812345678';
const DEMO_CARDS = ['VC20240001', 'VC20240002', 'VC20240004'];

export function MemberQueryBar({ onResult }: { onResult: (m: Member | null) => void }) {
  const [mode, setMode] = useState<Mode>('phone');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [reading, setReading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function queryByPhone() {
    setError(null);
    if (!/^\d{11}$/.test(phone.trim())) {
      setError('请输入正确的 11 位手机号');
      onResult(null);
      return;
    }
    setLoading(true);
    const m = await mockService.queryMemberByPhone(phone.trim());
    setLoading(false);
    if (!m) setError('未查询到该会员，请确认手机号或引导其办理入会');
    onResult(m);
  }

  async function queryByCard() {
    setError(null);
    setReading(true);
    await new Promise((r) => setTimeout(r, 1300));
    const cardNo = DEMO_CARDS[Math.floor(Math.random() * DEMO_CARDS.length)];
    const m = await mockService.queryMemberByCard(cardNo);
    setReading(false);
    if (!m) setError('读卡失败，请重新放置会员卡');
    onResult(m);
  }

  return (
    <section className="surface-card overflow-hidden">
      <div className="flex flex-col gap-3 border-b border-forest-100 bg-gradient-to-br from-forest-700 to-forest-800 px-5 py-4 text-cream-50 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <SectionTag className="text-gold-300">Cashier · 会员核验</SectionTag>
          <h2 className="mt-1 font-serif text-xl font-semibold">会员身份快速核验</h2>
        </div>
        <div className="inline-flex self-start rounded-xl bg-forest-900/40 p-1">
          {(['phone', 'card'] as Mode[]).map((m) => (
            <button
              key={m}
              onClick={() => {
                setMode(m);
                setError(null);
              }}
              className={cn(
                'btn-focus inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-medium transition',
                mode === m ? 'bg-cream-50 text-forest-800 shadow-sm' : 'text-cream-100/80 hover:text-cream-50',
              )}
            >
              {m === 'phone' ? <Phone className="h-4 w-4" /> : <CreditCard className="h-4 w-4" />}
              {m === 'phone' ? '手机号' : '刷卡'}
            </button>
          ))}
        </div>
      </div>

      <div className="p-5">
        {mode === 'phone' ? (
          <div className="space-y-3">
            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="flex-1">
                <Input
                  icon={<Phone className="h-4 w-4" />}
                  inputMode="numeric"
                  maxLength={11}
                  placeholder="请输入会员手机号"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                  onKeyDown={(e) => e.key === 'Enter' && queryByPhone()}
                />
              </div>
              <Button size="lg" loading={loading} onClick={queryByPhone}>
                <Search className="h-4 w-4" />
                查询会员
              </Button>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <button
                onClick={() => setPhone(DEMO_PHONE)}
                className="btn-focus inline-flex items-center gap-1 rounded-full bg-forest-50 px-2.5 py-1 font-medium text-forest-700 ring-1 ring-inset ring-forest-200 transition hover:bg-forest-100"
              >
                <ChevronRight className="h-3 w-3" />
                演示手机号 {DEMO_PHONE}
              </button>
              <span className="text-ink-400">回车键可直接查询</span>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4 py-6 text-center">
            <motion.button
              onClick={queryByCard}
              disabled={reading}
              whileTap={{ scale: 0.97 }}
              animate={reading ? { boxShadow: ['0 0 0 0 rgba(201,162,75,0.5)', '0 0 0 14px rgba(201,162,75,0)'] } : {}}
              transition={reading ? { repeat: Infinity, duration: 1.2 } : {}}
              className={cn(
                'btn-focus relative flex h-28 w-44 flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed transition',
                reading
                  ? 'border-gold-400 bg-gold-50 text-gold-700'
                  : 'border-forest-300 bg-forest-50 text-forest-700 hover:border-forest-500 hover:bg-forest-100',
              )}
            >
              <Nfc className={cn('h-8 w-8', reading && 'animate-pulse')} />
              <span className="text-sm font-medium">{reading ? '读卡中…' : '点击模拟刷卡'}</span>
            </motion.button>
            <p className="max-w-xs text-xs text-ink-400">
              将会员卡平放于读卡器感应区，系统将自动识别卡号并调取会员档案
            </p>
          </div>
        )}

        {error && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-3 rounded-lg bg-brick-50 px-3 py-2 text-xs font-medium text-brick-600 ring-1 ring-inset ring-brick-200"
          >
            {error}
          </motion.p>
        )}
      </div>
    </section>
  );
}
