import React, { useState }  from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, Send, Star, CheckCircle  , Menu, X, ShieldCheck, LockKeyhole, Fingerprint } from 'lucide-react';
import { FaPen, FaSyncAlt, FaUsers,FaUserCog,FaRobot } from 'react-icons/fa';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import "./style.css";
import { cn } from '@/lib/utils';
import  {LogoCloud} from '@/components/ui/logo-cloud-4';


const PlaceholderImage: React.FC<{ alt: string; className?: string }> = ({ alt, className = "w-full h-48 bg-gray-200 rounded-md flex items-center justify-center text-gray-500" }) => (
    <div className={className}>{alt}</div>
);
const LandingPage: React.FC = () => {
    const [isMenuOpen, setIsMenuOpen] = React.useState(false);

    const logos = [
        {
            src: "https://c.animaapp.com/VxEAZ424/img/github-logo-2-streamline-logos-block---free.svg",
            alt: "Github Logo",
        },
        {
            src: "https://c.animaapp.com/VxEAZ424/img/icons8-redis-1.svg",
            alt: "Redis",
        },
        {
            src: "https://c.animaapp.com/VxEAZ424/img/icons8-google-calendar-1.svg",
            alt: "Google Calendar",
        },
        {
            src: "https://www.freelogovectors.net/wp-content/uploads/2024/02/chatgpt-logo-icon-freelogovectors.net_.png",
            alt: "ChatGPT",
        },
        {
            src: "https://c.animaapp.com/VxEAZ424/img/icons8-grafana-1.svg",
            alt: "Grafana",
        },
        {
            src: "https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg",
            alt: "Google",
        },
        {
            src: "https://upload.wikimedia.org/wikipedia/commons/e/e9/Notion-logo.svg",
            alt: "Notion",
        },
    ];


    const securityFeatures = [
        {
            icon: <ShieldCheck className="w-8 h-10 text-blue-300" strokeWidth={1.3} />,
            title: "Data Encryption",
            description: "Your notes are encrypted end-to-end."
        },
        {
            icon: <LockKeyhole className="w-8 h-10 text-pink-300" strokeWidth={1.3} />,
            title: "Multi-Layer Security",
            description: "We use layered firewalls and secure servers."
        },
        {
            icon: <Fingerprint className="w-8 h-10 text-purple-300" strokeWidth={1.3} />,
            title: "User Control",
            description: "You control who accesses your content."
        }
    ];

    const documentFeatures = [
        {
            title: 'Effortless Writing',
            description: 'Focus on your ideas — format and move blocks with one click.',
            icon: <FaPen className="text-purple-400 text-xl" />,
        },
        {
            title: 'Auto Save & Sync',
            description: 'Never lose your progress. Smart Note saves as you type.',
            icon: <FaSyncAlt className="text-purple-400 text-xl" />,
        },
        {
            title: 'Share & Collaborate',
            description: 'Invite teammates or friends to edit, comment, or view your docs in real time.',
            icon: <FaUsers className="text-purple-400 text-xl" />,
        },
    ];

    const Panel = ({
                       icon,
                       title,
                       description,
                       children,
                       borderColor,
                       bgColor,
                       textColor,
                       style,
                   }: {
        icon: React.ReactNode;
        title: string;
        description: string;
        children: React.ReactNode;
        borderColor: string;
        bgColor: string;
        textColor: string;
        style?: React.CSSProperties;
    }) => (
        <div
            className={`rounded-lg shadow-md p-6 border ${borderColor} ${bgColor} ${textColor} `}
            style={style}
        >
            <div className="flex items-center mb-4">
                <div className="mr-3 flex-shrink-0">{icon}</div>
                <h3 className="font-semibold text-lg">{title}</h3>
            </div>
            <p className="mb-6 max-w-prose">{description}</p>
            {children}
        </div>
    );

    const ContentPlaceholder = ({ children }: { children: React.ReactNode }) => (
        <div className="bg-white rounded-md p-4 shadow-inner border border-gray-200 min-h-[240px]">
            {children}
        </div>
    );

    // const mainFeatures = [
    //     { title: "Templates", description: "Start quickly with pre-built templates.", imageAlt: "" },
    //     { title: "AI Assistance", description: "Enhance your writing with AI suggestions.", imageAlt: "" },
    //     { title: "Task Management", description: "Integrate tasks directly within your notes.", imageAlt: "" },
    //     // Add more features corresponding to the image
    // ];


    const stats = [
        { number: "10k+", label: "Active Users" },
        { number: "5M+", label: "Notes Created" },
        { number: "99.9%", label: "Uptime SLA" },
    ];

    const testimonials = [
        {
            name: "Sarah Johnson",
            role: "Product Manager",
            content: "SmartNotes has revolutionized how I organize my thoughts and project ideas. The AI categorization is incredible!",
            avatar: "SJ"
        },
        {
            name: "Mike Chen",
            role: "Software Engineer",
            content: "The search functionality is so fast and accurate. I can find any code snippet or meeting note in seconds.",
            avatar: "MC"
        },
        {
            name: "Emily Davis",
            role: "Designer",
            content: "Beautiful interface and intuitive design. It feels like the notes app I've always wanted.",
            avatar: "ED"
        }
    ];

    const pricingPlans = [
        {
            name: "Free",
            price: "$0",
            period: "/forerver",
            features: ["Basic search", "Web access", "Community support"],
            buttonText: "Get Started"
        },
        {
            name: "Pro",
            price: "$9",
            period: "/ month",
            features: ["AI categorization", "Advanced search", "Mobile apps", "Priority support"],
            popular: true,
            buttonText: "Start free trial"
        },
        {
            name: "Team",
            price: "$29",
            period: "/ month",
            features: ["Everything in Pro", "Admin dashboard", "SSO integration", "24/7 support"],
            buttonText: "Get free trial"
        }
    ];



    return (

        <div className="min-h-screen bg-white">
            {/* Navigation */}
            <nav className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center gap-2">
                            <BookOpen className="h-8 w-8 text-blue-600" />
                            <span className="text-2xl font-bold text-gray-900">Aeternus</span>
                        </div>


                        <div className="hidden md:flex items-center space-x-6">
                            <a href="#security" className="text-gray-600 hover:text-blue-600 transition-colors">Security</a>
                            <a href="#document" className="text-gray-600 hover:text-blue-600 transition-colors">Document</a>
                            <a href="#Integration" className="text-gray-600 hover:text-blue-600 transition-colors">Integration</a>
                            <a href="#Features" className="text-gray-600 hover:text-blue-600 transition-colors">Features</a>
                            <a href="#pricing" className="text-gray-600 hover:text-blue-600 transition-colors">Pricing</a>
                            <a href="#reviews" className="text-gray-600 hover:text-blue-600 transition-colors">Reviews</a>


                            <Link to="/signup">
                                <Button variant="default" size="sm">Get Started</Button> {/* Adjusted button style */}
                            </Link>
                        </div>


                        <div className="md:hidden">
                            <Button variant="ghost" size="icon" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                            </Button>
                        </div>
                    </div>

                    {/* Mobile Menu */}
                    {isMenuOpen && (
                        <div className="md:hidden py-4 border-t border-gray-100">
                            <div className="space-y-2 px-2">
                                <a href="#pricing" className="block px-3 py-2 text-gray-700 hover:text-blue-600" onClick={() => setIsMenuOpen(false)}>Pricing</a>
                                <a href="#document" className="block px-3 py-2 text-gray-700 hover:text-blue-600" onClick={() => setIsMenuOpen(false)}>Document</a>
                                <a href="#Integration" className="block px-3 py-2 text-gray-700 hover:text-blue-600" onClick={() => setIsMenuOpen(false)}>Integration</a>
                                <a href="#Features" className="block px-3 py-2 text-gray-700 hover:text-blue-600" onClick={() => setIsMenuOpen(false)}>Features</a>
                                <a href="#pricing" className="block px-3 py-2 text-gray-700 hover:text-blue-600" onClick={() => setIsMenuOpen(false)}>Pricing</a>
                                <a href="#reviews" className="block px-3 py-2 text-gray-700 hover:text-blue-600" onClick={() => setIsMenuOpen(false)}>Reviews</a>

                                <div className="pt-2 space-y-2">
                                    <Link to="/login" className="block">
                                        <Button className="w-full">Get Started</Button>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </nav>


            <section className="relative py-20 overflow-hidden">
                <div className="absolute inset-0">
                    <div className="absolute top-0 left-1/4 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
                    <div className="absolute top-0 right-1/4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
                    <div className="absolute -bottom-8 left-1/3 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
                </div>

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6">
                        Your Ideas,
                        <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> Organized</span>
                    </h1>
                    <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
                        Your mind, organized. Your projects, simplified. All your notes, tasks, and plans are here.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link to="/signup" className="block">
                            <Button size="lg" className="text-lg px-8 py-6">
                                Start Free Trial
                                <ArrowRight className="ml-2 h-5 w-5" />
                            </Button>
                        </Link>

                    </div>
                    <p className="text-sm text-gray-500 mt-4">No credit card required • 14-day free trial</p>
                </div>
            </section>

            {/* Security Section */}
            <section className="py-16" id="security">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-4">Security</h2>
                    <p className="text-lg text-center text-gray-600 dark:text-gray-300 mb-12">
                        Your data is private, encrypted, and protected — always.
                    </p>
                    <div className="grid md:grid-cols-3 gap-8">

                        {securityFeatures.map((feature, index) => (
                            <Card key={index} borderColor="purple">
                                <div className="p-6 flex justify-between items-center">
                                    <div>
                                        <h3 className="text-lg font-semibold mb-1">{feature.title}</h3>
                                        <p className="text-gray-600 dark:text-gray-400 text-sm">{feature.description}</p>
                                    </div>

                                    {/* Cột 2: Icon */}
                                    <div className="flex-shrink-0 ml-4">
                                        {feature.icon}
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>


            {/* Document Section */}
            <section className="py-16 bg-gray-50 dark:bg-slate-900">
                <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-10">
                    {/* Container */}
                    <div className="border glow-border rounded-lg p-8 bg-white dark:bg-slate-900">
                        {/* Title */}
                        <h2 className="text-3xl font-bold mb-4 text-center text-gray-900 dark:text-white">
                            Document
                        </h2>
                        {/* Subtitle */}
                        <div className="max-w-3xl mx-auto text-center mb-10 text-gray-800 dark:text-gray-300">
                            <p className="font-bold text-base mb-2">
                                Document: Write, Organize, and Share Easily
                            </p>
                            <p className="text-m leading-relaxed">
                                Aeternus lets you create beautiful documents in seconds — from class notes to project plans.
                                Type, drag, and format freely with our block system. Everything stays neat, synced, and ready to share
                            </p>
                        </div>
                        {/* Cards features */}
                        <div className="flex flex-col md:flex-row gap-6 md:gap-8 justify-between font-inter">
                            {documentFeatures.map((feature, idx) => (
                                <div
                                    key={idx}
                                    className="flex items-start bg-white dark:bg-slate-800 rounded-xl border border-purple-300 p-6 shadow-sm hover:shadow-lg transition-shadow flex-1"
                                >
                                    <div>
                                        <h3 className="text-purple-400 font-semibold mb-2 text-sm">
                                            {feature.title}
                                        </h3>
                                        <p className="text-gray-700 dark:text-gray-400 text-xs leading-normal">
                                            {feature.description}
                                        </p>
                                    </div>
                                    <div className="ml-auto opacity-40 mt-1">
                                        {feature.icon}
                                    </div>
                                </div>
                            ))}
                        </div>
                        {/* Text và button bottom right */}
                        <div className="flex justify-end items-center mt-6 space-x-4 max-w-6xl mx-auto">
                            <p className="italic text-gray-500 dark:text-gray-400 text-xs whitespace-nowrap">
                                Turn every thought into a smart document.
                            </p>
                            <button className="bg-pink-300 text-white text-xs px-3 py-1 rounded-md opacity-90 hover:opacity-100 transition-opacity whitespace-nowrap">
                                Start Writing &rarr;
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Integration Section */}
            <section className="py-10 overflow-hidden">
                <div className=" w-full place-content-center px-4">
                    <div aria-hidden="true" className={cn(
                        "-top-1/2 -translate-x-1/2 pointer-events-none absolute left-1/2 h-[120vmin] w-[200vmin] rounded-b-full",
                        "bg-[radial-gradient(ellipse_at_center,--theme(--color-foreground/.1),transparent_50%)]",
                        "blur-[30px]"
                    )}
                    />
                    <div className="text-center max-w-4xl mx-auto mb-8 px-4">
                        <h2 className="text-3xl font-bold mb-4 text-center text-gray-900 dark:text-white">
                            Integration
                        </h2>
                        <p className="text-muted-foreground text-base">
                            Sync tasks, attach files, and update notes automatically without switching tabs.
                        </p>
                    </div>
                    <div className="max-w-5xl mx-auto px-4 flex justify-center">
                        <LogoCloud logos={logos} />
                    </div>
                </div>

            </section>

            <section
                className="flex flex-col items-center bg-white py-16 px-4">
                {/* Main Title */}
                <div className="text-center mb-20 px-6">
                    <h2 className="text-4xl font-bold text-gray-900 mb-2">
                        Everything you need to stay organized
                    </h2>
                    <p className="text-sm text-gray-500 max-w-xl mx-auto">
                        Powerful{" "}
                        <span className="text-purple-600">features</span> designed to make note-taking
                        effortless and finding information instant.
                    </p>
                </div>
                <div className="w-full max-w-7xl mx-auto flex flex-col items-center gap-y-20 font-inter">
                    {/* Purple panel */}
                    <Panel
                        icon={<FaPen className="text-purple-600 w-5 h-5" />}
                        title="Note Management"
                        description="Easily create, edit, and organize various types of notes."
                        borderColor="border-purple-300"
                        bgColor="bg-purple-50"
                        textColor="text-gray-700"
                        style={{
                            maxWidth: 800,
                            width: '100%',
                        }}
                    >
                        <ContentPlaceholder>
                            <div
                                style={{width: '100%', height: 273 }}
                                className="max-w-full w-full h-[546px] flex items-center justify-center">

                                <img src="./src/images/note.png" alt="Note Management Interface" style={{width:'100%',height: '100%', objectFit: 'cover'}} />
                            </div>
                        </ContentPlaceholder>
                    </Panel>

                    {/* Blue panel */}
                    <Panel
                        icon={<FaUserCog className="text-blue-600 w-5 h-5" />}
                        title="User Experience"
                        description="Intuitive interface with customization for better productivity."
                        borderColor="border-blue-300"
                        bgColor="bg-blue-50"
                        textColor="text-gray-700"
                        style={{
                            maxWidth: 800,
                            width: '100%',
                        }}
                    >
                        <ContentPlaceholder>

                            <div
                                style={{width: '100%', height: 273 }}

                                className="flex items-center justify-center"
                            >
                                <p className="text-center text-gray-400 italic">
                                </p>
                                <img src="./src/images/user.png" alt="User Management Interface" style={{width:'100%',height: '100%', objectFit: 'cover'}} />

                            </div>
                        </ContentPlaceholder>
                    </Panel>

                    {/* Pink panel */}
                    <Panel
                        icon={<FaRobot className="text-pink-600 w-5 h-5" />}
                        title="AI Integration"
                        description="Summarize, translate, and refine notes with smart assistance."
                        borderColor="border-pink-300"
                        bgColor="bg-pink-50"
                        textColor="text-gray-700"
                        style={{
                            maxWidth: 800,
                            width: '100%',
                        }}
                    >
                        <ContentPlaceholder>

                            <div
                                style={{ width: '100%', height: 273

                                }}

                                className="flex items-center justify-center"
                            >
                                <p className="text-center text-gray-400 italic">


                                </p>
                                <img src="./src/images/ai.png" alt="AI Integration Interface" style={{width:'100%',height: '100%', objectFit: 'cover'}} />
                            </div>
                        </ContentPlaceholder>
                    </Panel>
                </div>
            </section>



            {/* Plan together*/}
            <section className="py-20">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="bg-blue-50 p-8 md:p-12 rounded-lg shadow-lg border border-blue-100 flex flex-col md:flex-row items-center gap-8">
                        <div className="md:w-1/2">
                            <h3 className="text-sm font-semibold text-blue-600 uppercase mb-2">Plan Together</h3>
                            <h2 className="text-3xl font-bold text-gray-900 mb-4">Craft your perfect trip with shared notes.</h2>
                            <p className="text-gray-600 mb-6">Use Aeternus to collaboratively plan itineraries, budgets, and packing lists with friends and family. Real-time updates keep everyone on the same page.</p>
                            <Button variant="outline">Explore Templates <ArrowRight className="ml-2 h-4 w-4" /></Button>
                        </div>
                        <div className="md:w-1/2">
                            {/* Placeholder for the Travel Planner screenshot */}
                            <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200">  
                               <img alt="templates" src="./src/images/share.png"className="w-full h-64 object-cover rounded-md bg-gray-100"/>
                           </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* "A complete..." Section */}
            <section className="py-20 bg-gray-50">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">A complete solution</h2>
                        <p className="text-lg text-gray-600">Built for teams and individuals who value clarity and efficiency.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                        {stats.map((stat) => (
                            <div key={stat.label}>
                                <p className="text-5xl font-bold text-blue-600 mb-2">{stat.number}</p>
                                <p className="text-gray-600">{stat.label}</p>
                            </div>
                        ))}
                    </div>
                    {/* Placeholder for the feature checklist image */}
                    <div className="mt-16 bg-white p-6 rounded-lg shadow-lg border border-gray-200 max-w-4xl mx-auto">
                        <PlaceholderImage alt="[Image comparing features]" className="w-full h-64 bg-gray-100 rounded-md flex items-center justify-center text-gray-500"/>
                    </div>
                </div>
            </section>

            {/* Testimonials Section (Keep as is) */}
            <section className="py-20 bg-purple-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-gray-900 mb-2">Loved by thousands of users</h2>
                        <p className="text-sm text-gray-700">See what our users have to say about Aeternus</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {testimonials.map((t, i) => (
                            <Card
                                key={i}
                                className="p-6 bg-white border border-purple-200 rounded-lg shadow-sm hover:shadow-md transition-shadow"
                            >
                                <div className="flex items-center mb-4 space-x-1">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} className="h-5 w-5 text-purple-300 fill-current" />
                                    ))}
                                </div>
                                <p className="text-gray-800 mb-6 italic text-sm leading-relaxed">"{t.content}"</p>
                                <div className="flex items-center">
                                    <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center text-white font-medium mr-3">
                                        {t.avatar}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-900">{t.name}</p>
                                        <p className="text-xs text-gray-700">{t.role}</p>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>


            {/* Pricing Section (Keep as is, adjusted button text) */}
            <section id="pricing" className="py-20 bg-purple-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Simple, transparent pricing</h2>
                        <p className="text-sm text-gray-700">Choose the plan that's right for you</p>
                    </div>
                    <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto items-start">
                        {pricingPlans.map((plan, index) => (
                            <Card
                                key={index}
                                className={`p-8 pt-12 bg-white border rounded-lg shadow-sm relative border-blue-200 ${
                                    plan.popular ? "border-blue-500 shadow-lg md:scale-105" : ""
                                }`}
                            >
                                {plan.popular && (
                                    <div className="absolute -top-5 left-1/2 transform -translate-x-1/2">
      <span className="bg-gradient-to-r from-blue-600 to-blue-500 text-white px-5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider select-none whitespace-nowrap shadow-md">
        Most Popular
      </span>
                                    </div>
                                )}

                                <div className="text-center mb-8">
                                    <h3 className="text-xl font-semibold mb-2">{plan.name}</h3>
                                    <div className="mb-4">
                                        <span className="text-3xl font-bold">{plan.price}</span>
                                        <span className="text-gray-600">{plan.period}</span>
                                    </div>
                                </div>

                                <ul className="space-y-3 mb-8">
                                    {plan.features.map((feature, featureIndex) => (
                                        <li key={featureIndex} className="flex items-center text-sm">
                                            <CheckCircle className="h-4 w-4 text-green-500 mr-3 flex-shrink-0" />
                                            <span>{feature}</span>
                                        </li>
                                    ))}
                                </ul>

                                <Button className="w-full bg-black border-black text-white hover:bg-gray-900">
                                    {plan.buttonText}
                                </Button>
                            </Card>

                        ))}
                    </div>
                </div>
            </section>


            {/* CTA Section (Keep as is) */}
            <section className="relative py-20 overflow-hidden">
                {/* Simple gradient blobs */}
                <div className="absolute inset-0">
                    <div className="absolute top-0 left-1/4 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
                    <div className="absolute top-0 right-1/4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
                    <div className="absolute -bottom-8 left-1/3 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
                </div>
                <div className="relative max-w-3xl mx-auto text-center px-4 sm:px-6 lg:px-8">
                    <h2 className="text-4xl font-bold text-black mb-4">
                        Ready to transform your note-taking?
                    </h2>
                    <p className="text-xl text-black-100 mb-8">
                        Join thousands of users who have already upgraded their productivity with Aeternus.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                     <Link to="/login" className="block">
                        <Button size="lg" variant="secondary" className="bg-black text-white px-8 py-6">
                            Join us now!
                            <ArrowRight className="ml-2 h-5 w-5" />
                        </Button>
                    </Link>    
                    </div>
                </div>
            </section>

            {/* Footer (Keep as is) */}
            <div className="footer-big font-inter">
                <div className="company-info">
                    <div className="text-wrapper flex items-center gap-2 font-gabarito">
                        <BookOpen className="h-8 w-8 text-blue-600" />
                         <h1 className="text-2xl font-bold text-gray-800">Aeternus</h1>
                        </div>

                    <div className="copyright">
                        <p className="div mb-6 text-xl font-semibold">
                            The smartest way to organize your thoughts and boost your
                            productivity.
                        </p>
                    </div>
                </div>

                <div className="links">
                    <div className="col">
                        <div className="text-wrapper-2">Product</div>

                        <div className="list-items">
                            <div className="text-wrapper-3">Document</div>

                            <div className="text-wrapper-4">Integration</div>

                            <div className="text-wrapper-4">Feature</div>

                            <div className="text-wrapper-4">Pricing</div>

                            <div className="text-wrapper-4">Reviews</div>

                            <div className="text-wrapper-4">{""}</div>
                        </div>
                    </div>

                    <div className="col">
                        <div className="text-wrapper-2">Support</div>

                        <div className="list-items">
                            <div className="text-wrapper-3">Help center</div>

                            <div className="text-wrapper-4">Terms of service</div>

                            <div className="text-wrapper-4">Security</div>

                            <div className="text-wrapper-4">Privacy policy</div>
                        </div>
                    </div>

                 <div className="col-2">
                    <div className="text-wrapper-2">Stay up to date</div>

                    <div className="email-input-field">
                        <div className="input-field-BG" />
                        <input
                        type="email"
                        placeholder="Your email address"
                        className="email-input"
                        />
                        <Send className="essential-icons-send" />
                    </div>
                    </div>

                </div>
            </div>

        </div>
    );
};
export default LandingPage;
