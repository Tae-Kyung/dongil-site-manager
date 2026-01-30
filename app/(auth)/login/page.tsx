'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Building2 } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent, retryCount = 0) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        // Handle network errors with retry
        if (error.message.toLowerCase().includes('fetch') && retryCount < 2) {
          console.log(`Login retry attempt ${retryCount + 1}...`)
          await new Promise(resolve => setTimeout(resolve, 1000))
          return handleSubmit(e, retryCount + 1)
        }

        setError(
          error.message === 'Invalid login credentials'
            ? '이메일 또는 비밀번호가 올바르지 않습니다.'
            : error.message.toLowerCase().includes('fetch')
              ? '네트워크 연결에 실패했습니다. 인터넷 연결을 확인해주세요.'
              : error.message
        )
        setIsLoading(false)
        return
      }

      // 완전한 페이지 리로드로 쿠키와 세션이 제대로 설정되도록 함
      window.location.href = '/'
    } catch (err) {
      // Handle unexpected errors (network issues, etc.)
      const errorMessage = err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.'

      // Retry on network errors
      if (errorMessage.toLowerCase().includes('fetch') && retryCount < 2) {
        console.log(`Login retry attempt ${retryCount + 1}...`)
        await new Promise(resolve => setTimeout(resolve, 1000))
        return handleSubmit(e, retryCount + 1)
      }

      setError(
        errorMessage.toLowerCase().includes('fetch')
          ? '네트워크 연결에 실패했습니다. 인터넷 연결을 확인해주세요.'
          : errorMessage
      )
      setIsLoading(false)
    }
  }

  return (
    <Card className="shadow-lg">
      <CardHeader className="text-center space-y-4">
        <div className="flex justify-center">
          <div className="w-16 h-16 bg-primary rounded-xl flex items-center justify-center">
            <Building2 className="w-10 h-10 text-primary-foreground" />
          </div>
        </div>
        <div>
          <CardTitle className="text-2xl font-bold">동일유리</CardTitle>
          <CardDescription className="mt-2">
            스마트 현장 관리 시스템
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">이메일</Label>
            <Input
              id="email"
              type="email"
              placeholder="example@dongil.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">비밀번호</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                로그인 중...
              </>
            ) : (
              '로그인'
            )}
          </Button>
        </form>

        <div className="mt-6 pt-6 border-t text-center text-sm text-muted-foreground">
          <p>테스트 계정</p>
          <p className="mt-1 font-mono text-xs">
            admin@dongil.com / admin123
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
