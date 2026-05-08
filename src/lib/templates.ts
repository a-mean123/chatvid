import type { PresetTemplate } from '@/types';

export const PRESET_TEMPLATES: PresetTemplate[] = [
  {
    id: 'viral-coding',
    name: 'Coding Flex',
    description: 'Viral coding conversation',
    icon: '💻',
    script: `Alex: bro what do you do for work
Me: i'm a developer
Alex: oh cool what kind
Me: full stack mostly
Alex: how much do you make if you don't mind
Me: like 180k a year
Alex: WHAT
Alex: bro i need to learn coding
Me: i can teach you if you want
Alex: for real??
Me: yeah it's not that hard once you start
Alex: ok i'm in`,
  },
  {
    id: 'plot-twist',
    name: 'Plot Twist',
    description: 'Unexpected turn conversation',
    icon: '🔄',
    script: `Sam: hey are you busy
Me: not really why
Sam: i need to tell you something important
Me: ok what is it
Sam: i've been learning to code for 3 months
Me: really?? that's awesome
Sam: i just got a job offer
Me: wait seriously?
Sam: 120k salary
Me: BRO
Sam: i used your advice
Sam: thank you so much`,
  },
  {
    id: 'toxic-boss',
    name: 'Toxic Boss',
    description: 'Standing up for yourself',
    icon: '😤',
    script: `Boss: can you work this weekend
Me: sorry i have plans
Boss: this is very important for the project
Me: i already worked 3 weekends in a row
Boss: we're a team here
Me: i'll get it done monday morning
Boss: i expected more from you
Me: and i expected fair treatment
Me: so i guess we're both disappointed`,
  },
  {
    id: 'crypto-bro',
    name: 'Crypto Advice',
    description: 'Rejecting bad advice',
    icon: '📈',
    script: `Mike: bro put everything in this coin
Me: what coin
Mike: SAFEMOON2.0 it's going 1000x
Me: lol no
Mike: you're gonna miss out bro trust me
Me: i'll pass
Mike: i put my whole savings in
Me: that's not a good idea
Mike: you'll regret this
--- 3 months later ---
Mike: ok you were right`,
  },
  {
    id: 'arabic-demo',
    name: 'Arabic Chat',
    description: 'RTL Arabic conversation demo',
    icon: '🌙',
    script: `Ahmed: أهلاً كيف حالك؟
Me: بخير الحمد لله وأنت؟
Ahmed: الحمد لله
Ahmed: هل تعلمت البرمجة؟
Me: نعم! أعمل مطور الآن
Ahmed: ماشاء الله هذا رائع
Me: شكراً جزيلاً
Ahmed: كم راتبك إذا لم تمانع؟
Me: حوالي 15000 ريال
Ahmed: والله كتير
Ahmed: علمني البرمجة`,
  },
];
