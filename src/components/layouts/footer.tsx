"use client"
import { useRef, useEffect, useState } from "react"
import Link from "next/link"
import { Facebook, Instagram, Twitter, MapPin, Mail, Phone, Youtube } from "lucide-react"
import { trpc } from "@/utils/trpc"
import Image from "next/image"
import { motion, useAnimation } from "framer-motion"
import { WhatsAppButton } from "../ui/button-wa"

export function Footer() {
  const { data, isLoading, error } = trpc.methods.getMethods.useQuery()
  const paymentMethods = data?.data || []
  const { data: settingWeb } = trpc.setting.getConfig.useQuery()
  const [containerWidth, setContainerWidth] = useState(0)

  // Duplikasi array untuk efek scrolling tak terbatas
  const duplicatedMethods = [...paymentMethods, ...paymentMethods, ...paymentMethods]

  // Referensi untuk lebar container
  const containerRef = useRef<HTMLDivElement>(null)
  const controls = useAnimation()

  useEffect(() => {
    if (containerRef.current) {
      setContainerWidth(containerRef.current.offsetWidth)
    }

    const handleResize = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth)
      }
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  useEffect(() => {
    // Tambahkan pengecekan tambahan untuk memastikan data sudah ada
    if (containerRef.current && paymentMethods.length > 0) {
      const width = containerRef.current.offsetWidth
      setContainerWidth(width)
      
      controls.start({
        x: [-width * 0.3, -width * 1.3],
        transition: {
          repeat: Number.POSITIVE_INFINITY,
          repeatType: "loop",
          duration: 25,
          ease: "linear",
        },
      })
    }
  }, [paymentMethods, controls])
  return (
    <footer className="relative pt-20 pb-12" aria-label="Footer Vazzuniverse">
      {/* Decorative elements */}
 
      <div className="container mx-auto px-4 max-w-7xl relative z-10">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-4 lg:gap-8">
          {/* Informasi Perusahaan */}
          <div className="space-y-6">
            {isLoading ? (
              <div className="animate-pulse h-24 bg-gray-700 rounded-md"></div>
            ) : (
              <>
                <div className="flex items-center space-x-3">
                  <div className="relative h-16 w-16 overflow-hidden rounded-lg  p-1 shadow-lg">
                    <Image
                      src={settingWeb?.logo_footer || "https://res.cloudinary.com/dstvymie8/image/upload/v1741104560/LOGO_VAZZ_STORE_2_dereyt.webp"}
                      alt="Logo Vazzuniverse"
                      width={100}
                      height={100}
                      className="object-contain"
                    
                    />
                  </div>
                  <div className="flex flex-col">
                    <h3 className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-2xl font-bold text-transparent">
                      Vazzuniverse
                    </h3>
                    <p className="text-gray-400 text-sm">Tempat Top-Up Terpercaya Se-Universe</p>
                  </div>
                </div>
                <p className="text-gray-400 text-sm leading-relaxed border-l-2 border-purple-500 pl-4">
                {(
                    (settingWeb?.deskripsi_web as string) ||
                    "Vazzuniverse menyediakan layanan top-up game dengan harga terbaik, proses cepat, dan pelayanan 24/7 untuk semua kebutuhan gaming Anda."
                  ).split(".")[0] + "."}
                </p>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm text-gray-400">
                    <MapPin className="h-4 w-4 text-purple-500" />
                    <span>Jakarta, Indonesia</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-400">
                    <Mail className="h-4 w-4 text-purple-500" />
                    <span>storevazz09@gmail.com</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-400">
                    <Phone className="h-4 w-4 text-purple-500" />
                    <span>{process.env.NEXT_PUBLIC_NOMOR_ADMIN}</span>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Link Game */}
          <div className="space-y-5">
            <h3 className="text-lg font-semibold text-white relative">
              <span className="relative z-10">Game Populer</span>
              <span className="absolute bottom-0 left-0 h-1 w-10 bg-gradient-to-r from-blue-500 to-purple-500"></span>
            </h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link
                  href="/order/mobile-legend"
                  className="group flex items-center text-gray-400 transition-colors hover:text-white"
                >
                  <span className="mr-2 h-1.5 w-1.5 rounded-full bg-purple-500 opacity-0 transition-opacity group-hover:opacity-100"></span>
                  Mobile Legends Bang Bang
                </Link>
              </li>
              <li>
                <Link
                  href="/order/pubg-mobile"
                  className="group flex items-center text-gray-400 transition-colors hover:text-white"
                >
                  <span className="mr-2 h-1.5 w-1.5 rounded-full bg-purple-500 opacity-0 transition-opacity group-hover:opacity-100"></span>
                  PUBG Mobile
                </Link>
              </li>
              <li>
                <Link
                  href="/order/free-fire"
                  className="group flex items-center text-gray-400 transition-colors hover:text-white"
                >
                  <span className="mr-2 h-1.5 w-1.5 rounded-full bg-purple-500 opacity-0 transition-opacity group-hover:opacity-100"></span>
                  Free Fire
                </Link>
              </li>
              <li>
                <Link
                  href="/order/valorant"
                  className="group flex items-center text-gray-400 transition-colors hover:text-white"
                >
                  <span className="mr-2 h-1.5 w-1.5 rounded-full bg-purple-500 opacity-0 transition-opacity group-hover:opacity-100"></span>
                  Valorant
                </Link>
              </li>
              <li>
                <Link
                  href="/order/genshin-impact"
                  className="group flex items-center text-gray-400 transition-colors hover:text-white"
                >
                  <span className="mr-2 h-1.5 w-1.5 rounded-full bg-purple-500 opacity-0 transition-opacity group-hover:opacity-100"></span>
                  Genshin Impact
                </Link>
              </li>
            </ul>
          </div>

          {/* Link Bantuan */}
          <div className="space-y-5">
            <h3 className="text-lg font-semibold text-white relative">
              <span className="relative z-10">Bantuan</span>
              <span className="absolute bottom-0 left-0 h-1 w-10 bg-gradient-to-r from-blue-500 to-purple-500"></span>
            </h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link
                  href="/cara-top-up"
                  className="group flex items-center text-gray-400 transition-colors hover:text-white"
                >
                  <span className="mr-2 h-1.5 w-1.5 rounded-full bg-purple-500 opacity-0 transition-opacity group-hover:opacity-100"></span>
                  Cara Top Up
                </Link>
              </li>
              <li>
                <Link
                  href="/syarat-ketentuan"
                  className="group flex items-center text-gray-400 transition-colors hover:text-white"
                >
                  <span className="mr-2 h-1.5 w-1.5 rounded-full bg-purple-500 opacity-0 transition-opacity group-hover:opacity-100"></span>
                  Syarat & Ketentuan
                </Link>
              </li>
              <li>
                <Link
                  href="/kebijakan-privasi"
                  className="group flex items-center text-gray-400 transition-colors hover:text-white"
                >
                  <span className="mr-2 h-1.5 w-1.5 rounded-full bg-purple-500 opacity-0 transition-opacity group-hover:opacity-100"></span>
                  Kebijakan Privasi
                </Link>
              </li>
              
            
            </ul>
          </div>

          {/* Social Media */}
          <div className="space-y-5">
            <h3 className="text-lg font-semibold text-white relative">
              <span className="relative z-10">Ikuti Kami</span>
              <span className="absolute bottom-0 left-0 h-1 w-10 bg-gradient-to-r from-blue-500 to-purple-500"></span>
            </h3>
            <div className="flex flex-wrap gap-3">
              <Link
                href={settingWeb?.url_fb || '/'}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-800 text-gray-400 transition-all hover:bg-blue-600 hover:text-white"
                aria-label="Facebook"
              >
                <Facebook className="h-5 w-5" />
              </Link>
              <Link
                href={settingWeb?.url_ig || 'https://instagram.com/vazzuniverse'}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-800 text-gray-400 transition-all hover:bg-gradient-to-br hover:from-purple-600 hover:to-pink-500 hover:text-white"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5" />
              </Link>
              <Link
                href={settingWeb?.url_youtube || 'https://youtube.com'}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-800 text-gray-400 transition-all hover:bg-blue-500 hover:text-white"
                aria-label="Twitter"
              >
                <Youtube className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>

        {/* Metode Pembayaran - Slider Framer Motion */}
        <div className="mt-12">
          <div className="flex items-center gap-4 mb-6">
            <div className="h-px flex-1 bg-gray-800"></div>
            <h3 className="text-base font-medium text-white">Metode Pembayaran</h3>
            <div className="h-px flex-1 bg-gray-800"></div>
          </div>

          <div className="relative overflow-hidden rounded-lg py-6 backdrop-blur-sm" ref={containerRef}>
            {isLoading ? (
              <div className="flex justify-center py-4">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-400 border-t-purple-500"></div>
              </div>
            ) : error ? (
              <div className="flex justify-center py-4 text-red-400">
                <span>Gagal memuat metode pembayaran</span>
              </div>
            ) : (
              <motion.div className="flex gap-8" animate={controls}>
                {/* Payment methods */}
                {duplicatedMethods.length > 0 ? (
                  duplicatedMethods.map((method, index) => (
                    <div key={`${method.id}-${index}`} className="flex flex-col items-center min-w-[100px]">
                      <div className="h-12 w-20 flex items-center justify-center rounded-md p-1">
                        <Image
                          width={80}
                          height={48}
                          src={method.images}
                          alt={`Pembayaran dengan ${method.name}`}
                          className="h-auto w-auto max-h-full max-w-full object-contain"
                        />
                      </div>
                    </div>
                  ))
                ) : (
                  // Metode pembayaran cadangan jika tidak ada data
                  <>
                    {[
                      { id: "visa", name: "Visa" },
                      { id: "mastercard", name: "Mastercard" },
                      { id: "paypal", name: "PayPal" },
                      { id: "bca", name: "Bank BCA" },
                      { id: "bni", name: "Bank BNI" },
                      { id: "bri", name: "Bank BRI" },
                      { id: "mandiri", name: "Bank Mandiri" },
                      { id: "gopay", name: "GoPay" },
                      { id: "dana", name: "DANA" },
                      { id: "ovo", name: "OVO" },
                      { id: "linkaja", name: "LinkAja" },
                      { id: "shopeepay", name: "ShopeePay" },
                      // Duplikasi untuk efek berkelanjutan
                      { id: "visa-2", name: "Visa" },
                      { id: "mastercard-2", name: "Mastercard" },
                      { id: "paypal-2", name: "PayPal" },
                      { id: "bca-2", name: "Bank BCA" },
                      { id: "bni-2", name: "Bank BNI" },
                      { id: "bri-2", name: "Bank BRI" },
                      { id: "mandiri-2", name: "Bank Mandiri" },
                      { id: "gopay-2", name: "GoPay" },
                      { id: "dana-2", name: "DANA" },
                      { id: "ovo-2", name: "OVO" },
                      { id: "linkaja-2", name: "LinkAja" },
                      { id: "shopeepay-2", name: "ShopeePay" },
                    ].map((method) => (
                      <div key={method.id} className="flex flex-col items-center min-w-[100px]">
                        <div className="h-12 w-20 flex items-center justify-center rounded-md p-1">
                          <Image
                            width={80}
                            height={48}
                            src="/placeholder.svg?height=48&width=80"
                            alt={`Pembayaran dengan ${method.name}`}
                            className="h-auto max-h-full object-contain"
                          />
                        </div>
                      </div>
                    ))}
                  </>
                )}
              </motion.div>
            )}
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-12">
          <div className="h-px w-full bg-gradient-to-r from-transparent via-gray-700 to-transparent"></div>
          <div className="mt-8 flex flex-col items-center justify-between gap-4 md:flex-row">
            <p className="text-center text-sm text-gray-400">
              © {new Date().getFullYear()} <span className="font-medium text-white">Vazzuniverse</span>. Seluruh hak
              cipta dilindungi.
            </p>
            <div className="flex items-center gap-6">
              <Link href="/kebijakan-privasi" className="text-xs text-gray-500 hover:text-gray-300">
                Privasi
              </Link>
              <Link href="/syarat-ketentuan" className="text-xs text-gray-500 hover:text-gray-300">
                Ketentuan
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* WhatsApp Button with improved styling */}
      <WhatsAppButton image={(settingWeb?.logo_cs as string) || "https://res.cloudinary.com/dazayhg7s/image/upload/v1742701209/HELPDESK_ICON_ti2xn7.png"} />
    </footer>
  )
}

