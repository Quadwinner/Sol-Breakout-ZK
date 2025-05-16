import Link from 'next/link';
import Image from 'next/image';

export default function Home() {
  return (
    <div className="space-y-24">
      {/* Hero Section with animated background */}
      <section className="py-24 md:py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-gray-900 dark:to-purple-950">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
            <div className="absolute top-0 -right-4 w-72 h-72 bg-indigo-400 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
            <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-400 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>
          </div>
        </div>

        <div className="container mx-auto px-4 relative z-10 flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 mb-16 md:mb-0 md:pr-12">
            <div className="relative">
              <div className="absolute -top-10 -left-10 w-32 h-32 bg-purple-500/20 rounded-full blur-xl animate-pulse"></div>
              <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-indigo-500/20 rounded-full blur-xl animate-pulse animation-delay-2000"></div>
              
              <div className="bg-white/30 dark:bg-black/20 backdrop-blur-xl rounded-3xl p-8 md:p-10 shadow-xl border border-white/20 dark:border-white/5">
                <span className="text-sm font-semibold px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-900/40 text-purple-800 dark:text-purple-200 inline-block mb-4">
                  Revolutionary Token Technology
                </span>
                <h1 className="text-5xl md:text-6xl font-extrabold mb-6 text-gray-900 dark:text-white">
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 animate-gradient-x">Compressed</span><br/>
                  Proof of Participation
                </h1>
                <p className="text-xl mb-8 text-gray-700 dark:text-gray-300 leading-relaxed font-light">
                  Create, distribute, and verify participation rewards with ZK Compression on Solana.
                  Save up to <span className="font-bold text-purple-600 dark:text-purple-400 relative inline-block">
                    <span className="relative z-10">1000x</span>
                    <span className="absolute bottom-0 left-0 right-0 h-3 bg-purple-200 dark:bg-purple-900/40 -z-0 transform -rotate-1"></span>
                  </span> on costs while maintaining security and scalability.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link 
                    href="/campaigns/create" 
                    className="group relative px-8 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl transition-all duration-300 font-medium text-center shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40 transform hover:-translate-y-1 overflow-hidden"
                  >
                    <span className="relative z-10">Create Campaign</span>
                    <span className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300"></span>
                  </Link>
                  <Link 
                    href="/campaigns" 
                    className="group relative px-8 py-4 bg-white hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-xl transition-all duration-300 font-medium text-center shadow-md hover:shadow-lg transform hover:-translate-y-1 overflow-hidden"
                  >
                    <span className="relative z-10">Explore Campaigns</span>
                    <span className="absolute inset-0 bg-gradient-to-r from-purple-600 to-indigo-600 opacity-0 group-hover:opacity-10 transition-opacity duration-300"></span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
          <div className="md:w-1/2 relative">
            <div className="w-full h-[450px] rounded-2xl shadow-2xl overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-600 via-indigo-600 to-purple-600 animate-gradient-x"></div>
              
              {/* Floating elements */}
              <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-[20%] left-[20%] w-16 h-16 border-4 border-white/30 rounded-full animate-float"></div>
                <div className="absolute top-[60%] left-[60%] w-10 h-10 border-2 border-white/30 rounded-full animate-float animation-delay-1000"></div>
                <div className="absolute top-[40%] right-[30%] w-20 h-8 border-2 border-white/30 rounded-full animate-float animation-delay-2000"></div>
                <div className="absolute bottom-[20%] left-[40%] w-8 h-8 border-2 border-white/30 rounded-full animate-float animation-delay-3000"></div>
                <div className="absolute top-[10%] right-[10%] w-6 h-6 border-2 border-white/30 rounded-full animate-float animation-delay-4000"></div>
              </div>
              
              <div className="absolute inset-0 flex flex-col items-center justify-center z-20 p-6">
                <div className="w-20 h-20 mb-6 relative">
                  <div className="absolute inset-0 bg-white rounded-full opacity-10 animate-ping animation-delay-2000"></div>
                  <div className="absolute inset-0 bg-white rounded-full opacity-70"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-purple-900" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
                <span className="text-white text-3xl font-bold mb-3 tracking-tight">ZK Compression</span>
                <p className="text-white/90 text-center text-lg">Secure, scalable token distribution at a fraction of the cost</p>
                
                <div className="grid grid-cols-2 gap-4 mt-8 w-full max-w-md">
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/10">
                    <div className="text-white text-2xl font-bold">1000x</div>
                    <div className="text-white/80 text-sm">Cost Savings</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/10">
                    <div className="text-white text-2xl font-bold">100%</div>
                    <div className="text-white/80 text-sm">Secure</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section with enhanced visuals */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 rounded-3xl my-8"></div>
        <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-purple-500/5 to-transparent"></div>
        <div className="absolute bottom-0 inset-x-0 h-40 bg-gradient-to-t from-indigo-500/5 to-transparent"></div>
        
        {/* Decorative elements */}
        <div className="absolute left-0 top-1/4 w-32 h-32 bg-purple-400/20 rounded-full filter blur-3xl"></div>
        <div className="absolute right-0 bottom-1/4 w-32 h-32 bg-indigo-400/20 rounded-full filter blur-3xl"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <span className="inline-block px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 rounded-full text-sm font-medium mb-4">
              Game-Changing Technology
            </span>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900 dark:text-white bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-600">
              Why Use ZK Compression?
            </h2>
            <p className="max-w-2xl mx-auto text-gray-600 dark:text-gray-300 text-xl">
              Revolutionary technology that makes token distribution accessible and affordable for everyone
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="group bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 transform transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-600/5 to-indigo-600/5 dark:from-purple-900/10 dark:to-indigo-900/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-2xl flex items-center justify-center mb-8 text-purple-600 dark:text-purple-300 group-hover:bg-purple-600 dark:group-hover:bg-purple-500 group-hover:text-white transition-colors duration-300 relative z-10">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white relative z-10">Cost Efficiency</h3>
              <p className="text-gray-600 dark:text-gray-300 relative z-10">
                Save up to <span className="font-bold">1000x</span> on token creation and distribution costs compared to traditional tokens,
                making it economical to reward thousands of participants.
              </p>
            </div>
            
            <div className="group bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 transform transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-600/5 to-indigo-600/5 dark:from-purple-900/10 dark:to-indigo-900/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-2xl flex items-center justify-center mb-8 text-purple-600 dark:text-purple-300 group-hover:bg-purple-600 dark:group-hover:bg-purple-500 group-hover:text-white transition-colors duration-300 relative z-10">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white relative z-10">Security & Privacy</h3>
              <p className="text-gray-600 dark:text-gray-300 relative z-10">
                Zero-knowledge proofs ensure secure verification without revealing personal data.
                Maintain the highest level of security while lowering costs.
              </p>
            </div>
            
            <div className="group bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 transform transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-600/5 to-indigo-600/5 dark:from-purple-900/10 dark:to-indigo-900/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-2xl flex items-center justify-center mb-8 text-purple-600 dark:text-purple-300 group-hover:bg-purple-600 dark:group-hover:bg-purple-500 group-hover:text-white transition-colors duration-300 relative z-10">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white relative z-10">Scalability</h3>
              <p className="text-gray-600 dark:text-gray-300 relative z-10">
                Handle millions of participants without significant cost increases.
                Perfect for large-scale events, loyalty programs, and community rewards.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Use Cases with more visual flair */}
      <section className="py-24 relative overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <span className="inline-block px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-300 rounded-full text-sm font-medium mb-4">
              Endless Possibilities
            </span>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900 dark:text-white">
              Use Cases
            </h2>
            <p className="max-w-2xl mx-auto text-gray-600 dark:text-gray-300 text-xl mb-6">
              Discover how compressed tokens can transform your projects
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                title: 'Conference Attendance',
                description: 'Issue proof of attendance tokens for events and track session participation',
                icon: '🎟️',
                color: 'from-pink-500 to-rose-500',
              },
              {
                title: 'Community Rewards',
                description: 'Reward members for contributions with tiered reward systems',
                icon: '🏆',
                color: 'from-amber-500 to-orange-500',
              },
              {
                title: 'Loyalty Programs',
                description: 'Create customer loyalty tokens redeemable for benefits and discounts',
                icon: '💰',
                color: 'from-cyan-500 to-blue-500',
              },
              {
                title: 'Educational Credentials',
                description: 'Issue verifiable course completion and achievement certificates',
                icon: '🎓',
                color: 'from-emerald-500 to-green-500',
              },
            ].map((useCase, i) => (
              <div key={i} className="group bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 transform transition-all duration-300 hover:-translate-y-2 hover:shadow-xl overflow-hidden">
                <div className={`w-full h-28 bg-gradient-to-br ${useCase.color} flex items-center justify-center text-5xl relative`}>
                  <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                  <span className="transform group-hover:scale-110 transition-transform duration-300">{useCase.icon}</span>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">{useCase.title}</h3>
                  <p className="text-gray-600 dark:text-gray-300">{useCase.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced CTA Section */}
      <section className="relative py-20 mb-16">
        <div className="absolute inset-0 rounded-3xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 animate-gradient-x"></div>
          
          {/* Fancy background elements */}
          <div className="absolute inset-0">
            <div className="absolute top-0 w-full h-24 bg-white/5"></div>
            <div className="absolute bottom-0 w-full h-24 bg-black/5"></div>
            <div className="absolute left-0 top-1/4 w-32 h-32 bg-white/10 rounded-full filter blur-xl"></div>
            <div className="absolute right-0 bottom-1/4 w-32 h-32 bg-white/10 rounded-full filter blur-xl"></div>
            
            {/* Animated particles */}
            <div className="absolute left-1/4 top-1/3 w-4 h-4 bg-white/40 rounded-full animate-float"></div>
            <div className="absolute right-1/4 top-2/3 w-6 h-6 bg-white/30 rounded-full animate-float animation-delay-2000"></div>
            <div className="absolute left-1/3 bottom-1/4 w-5 h-5 bg-white/20 rounded-full animate-float animation-delay-4000"></div>
          </div>
        </div>
        
        <div className="relative py-16 px-4 z-10">
          <div className="container mx-auto text-center max-w-3xl">
            <span className="inline-block px-3 py-1 bg-white/20 text-white rounded-full text-sm font-medium mb-6 backdrop-blur-sm">
              Get Started Today
            </span>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">Ready to Create Your First Campaign?</h2>
            <p className="text-xl mb-10 text-purple-100 leading-relaxed">
              Start distributing compressed tokens to your participants today and see the benefits of ZK Compression on Solana.
            </p>
            <Link 
              href="/campaigns/create" 
              className="group relative px-10 py-4 bg-white hover:bg-gray-50 text-purple-600 rounded-xl transition-all duration-300 font-bold text-lg inline-block shadow-xl hover:shadow-2xl transform hover:-translate-y-1 overflow-hidden"
            >
              <span className="relative z-10">Get Started Now</span>
              <span className="absolute inset-0 bg-gradient-to-r from-purple-600/10 to-indigo-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
} 