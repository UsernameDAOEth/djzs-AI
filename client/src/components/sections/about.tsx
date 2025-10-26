export function About() {
  return (
    <section className="relative py-20">
      <div className="mx-auto max-w-5xl px-6">
        <div className="glass-card-strong rounded-3xl p-8 md:p-12">
          <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
            <div>
              <h2 className="text-3xl font-bold text-white md:text-4xl">About DJZS</h2>
              <p className="mt-4 text-lg text-white/80">
                <strong>DJZS Newsletter</strong> is a Web3-native platform for premium crypto content and AI-powered writing:
              </p>
              <div className="mt-6 space-y-3 text-white/70">
                <p>📰 <strong className="text-white/90">Premium newsletters</strong> with market analysis and trading insights</p>
                <p>🤖 <strong className="text-white/90">AI writing assistant</strong> powered by Nous Research Hermes-4</p>
                <p>✍️ <strong className="text-white/90">Writing journal</strong> to create and save your trading content</p>
                <p>🔐 <strong className="text-white/90">NFT subscription</strong> - one mint, permanent access (0.001 ETH)</p>
              </div>
              <p className="mt-6 text-white/80">
                Built on Unlock Protocol and Base chain.<br />
                Your Subscribe NFT unlocks all features permanently.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <a href="#" className="inline-flex items-center gap-2 text-primary hover:text-primary/80" data-testid="link-twitter">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                  </svg>
                  Follow on Twitter
                </a>
                <a href="#" className="inline-flex items-center gap-2 text-secondary hover:text-secondary/80" data-testid="link-discord">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
                  </svg>
                  Join Discord
                </a>
              </div>
            </div>
            <div className="flex items-center justify-center">
              <div className="relative">
                <div className="absolute -inset-4 rounded-full bg-gradient-to-r from-primary to-secondary opacity-20 blur-2xl"></div>
                <div className="relative flex h-64 w-64 items-center justify-center rounded-full border border-white/20 bg-gradient-to-br from-white/5 to-white/0">
                  <div className="text-center">
                    <div className="text-5xl font-black text-white">∞</div>
                    <div className="mt-2 text-sm text-white/60">Unlimited Supply</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
