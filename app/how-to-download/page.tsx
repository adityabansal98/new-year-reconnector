"use client"

import { ArrowLeft, ExternalLink, FileText, CheckCircle } from "lucide-react"
import Link from "next/link"

export default function HowToDownloadPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          {/* Back Button */}
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-200 mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </Link>

          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-4">
              <FileText className="w-10 h-10 text-purple-400" />
              <h1 className="text-4xl font-bold text-slate-100">
                How to Download Your LinkedIn Connections
              </h1>
            </div>
            <p className="text-slate-400 text-lg">
              Follow these simple steps to export your LinkedIn connections as a CSV file
            </p>
          </div>

          {/* Instructions */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-8 space-y-8">
            {/* Step 1 */}
            <div className="flex gap-6">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-full bg-purple-600 flex items-center justify-center text-white font-bold text-xl">
                  1
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-slate-100 mb-3">
                  Go to LinkedIn Data Download Page
                </h3>
                <p className="text-slate-300 mb-4">
                  Click the link below to go directly to LinkedIn&apos;s data download page. You&apos;ll need to sign in if you haven&apos;t already.
                </p>
                <a
                  href="https://www.linkedin.com/mypreferences/d/download-my-data"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors font-medium"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Open LinkedIn Data Download</span>
                </a>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex gap-6">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-full bg-purple-600 flex items-center justify-center text-white font-bold text-xl">
                  2
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-slate-100 mb-3">
                  Select &quot;Download larger data archive&quot;
                </h3>
                <p className="text-slate-300 mb-4">
                  On the data download page, look for the option that says:{" "}
                  <span className="text-purple-400 font-medium">&quot;Download larger data archive, including connections, verifications, contacts, account history, and information we infer about you based on your profile and activity.&quot;</span>
                </p>
                <p className="text-slate-300 mb-4">
                  Click on this option (it may be a button or a link).
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex gap-6">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-full bg-purple-600 flex items-center justify-center text-white font-bold text-xl">
                  3
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-slate-100 mb-3">
                  Confirm Your Request
                </h3>
                <p className="text-slate-300 mb-4">
                  LinkedIn will ask you to confirm your request. Click{" "}
                  <span className="text-purple-400 font-medium">&quot;Request archive&quot;</span> or the confirmation button to proceed.
                </p>
              </div>
            </div>

            {/* Step 4 */}
            <div className="flex gap-6">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-full bg-purple-600 flex items-center justify-center text-white font-bold text-xl">
                  4
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-slate-100 mb-3">
                  Wait for Email
                </h3>
                <p className="text-slate-300 mb-4">
                  LinkedIn will process your request and send you an email (usually within a few minutes to an hour) with a download link.
                </p>
              </div>
            </div>

            {/* Step 5 */}
            <div className="flex gap-6">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-full bg-purple-600 flex items-center justify-center text-white font-bold text-xl">
                  5
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-slate-100 mb-3">
                  Download and Extract
                </h3>
                <p className="text-slate-300 mb-4">
                  Click the download link in the email, download the ZIP file, and extract it. Look for the file named{" "}
                  <span className="text-purple-400 font-medium">&quot;Connections.csv&quot;</span> inside the extracted folder.
                </p>
              </div>
            </div>
          </div>

          {/* Quick Tips */}
          <div className="mt-8 bg-purple-950/20 border border-purple-800/50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-slate-100 mb-4 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-purple-400" />
              Quick Tips
            </h3>
            <ul className="space-y-2 text-slate-300">
              <li className="flex items-start gap-2">
                <span className="text-purple-400 mt-1">•</span>
                <span>The CSV file contains: First Name, Last Name, Email Address, Company, Position, Connected On, and URL</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-400 mt-1">•</span>
                <span>LinkedIn may take up to 24 hours to prepare your data, but it&apos;s usually much faster</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-400 mt-1">•</span>
                <span>Make sure you&apos;re using the same LinkedIn account you want to analyze</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-400 mt-1">•</span>
                <span>The download link in the email expires after 7 days, so download it promptly</span>
              </li>
            </ul>
          </div>

          {/* Direct Link Section */}
          <div className="mt-8 bg-purple-950/20 border border-purple-800/50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-slate-100 mb-3 flex items-center gap-2">
              <FileText className="w-5 h-5 text-purple-400" />
              Quick Access
            </h3>
            <p className="text-slate-300 mb-4">
              You can access the LinkedIn data download page directly using the link below:
            </p>
            <a
              href="https://www.linkedin.com/mypreferences/d/download-my-data"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all font-medium"
            >
              <ExternalLink className="w-5 h-5" />
              <span>Go to LinkedIn Data Download</span>
            </a>
            <p className="text-slate-400 text-sm mt-4">
              Make sure to select the &quot;Download larger data archive&quot; option which includes connections data.
            </p>
          </div>

          {/* CTA */}
          <div className="mt-8 text-center">
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all transform hover:scale-105"
            >
              <FileText className="w-5 h-5" />
              <span>Ready to Upload Your Connections</span>
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
