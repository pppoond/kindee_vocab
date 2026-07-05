"use client"

import { useState, useRef } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Loader2, UploadCloud, X } from "lucide-react"
import { submitTicket } from "@/app/actions/ticket"
import { useAlert } from "./alert-provider"

interface TicketModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function TicketModal({ open, onOpenChange }: TicketModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [type, setType] = useState("bug")
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { showAlert } = useAlert()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      if (selectedFile.size > 5 * 1024 * 1024) {
        showAlert("ไฟล์ต้องมีขนาดไม่เกิน 5MB", { type: "error" })
        return
      }
      setFile(selectedFile)
      setPreviewUrl(URL.createObjectURL(selectedFile))
    }
  }

  const removeFile = () => {
    setFile(null)
    setPreviewUrl(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const resetForm = () => {
    setType("bug")
    setTitle("")
    setDescription("")
    removeFile()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title || !description) {
      showAlert("กรุณากรอกหัวข้อและรายละเอียดให้ครบถ้วน", { type: "error" })
      return
    }

    setIsLoading(true)
    
    try {
      const formData = new FormData()
      formData.append("type", type)
      formData.append("title", title)
      formData.append("description", description)
      if (file) {
        formData.append("image", file)
      }

      const result = await submitTicket(formData)
      
      if (result.error) {
        showAlert(result.error, { type: "error" })
      } else {
        showAlert("ส่งข้อมูลสำเร็จ! ขอบคุณที่ช่วยแจ้งปัญหาครับ", { type: "success" })
        resetForm()
        onOpenChange(false)
      }
    } catch (error) {
      console.error(error)
      showAlert("เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง", { type: "error" })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>แจ้งปัญหาการใช้งาน (Ticket)</DialogTitle>
            <DialogDescription>
              พบปัญหา บั๊ก หรืออยากเสนอแนะฟีเจอร์ใหม่ สามารถแจ้งได้เลยครับ
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="type">ประเภท</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger id="type">
                  <SelectValue placeholder="เลือกประเภท..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bug">แจ้งบั๊ก (Bug)</SelectItem>
                  <SelectItem value="account">ปัญหาบัญชี (Account)</SelectItem>
                  <SelectItem value="feature">เสนอแนะฟีเจอร์ (Feature Request)</SelectItem>
                  <SelectItem value="other">อื่นๆ (Other)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="title">หัวข้อ</Label>
                <span className="text-xs text-muted-foreground">{title.length}/100</span>
              </div>
              <Input 
                id="title" 
                placeholder="อธิบายสั้นๆ เช่น ล็อกอินไม่ได้, รูปไม่ขึ้น" 
                value={title}
                maxLength={100}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            
            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="description">รายละเอียดเพิ่มเติม</Label>
                <span className="text-xs text-muted-foreground">{description.length}/255</span>
              </div>
              <Textarea 
                id="description" 
                placeholder="อธิบายปัญหาที่คุณพบอย่างละเอียด..." 
                rows={4}
                value={description}
                maxLength={255}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label>แนบรูปภาพ (ถ้ามี)</Label>
              {previewUrl ? (
                <div className="relative rounded-md overflow-hidden border border-zinc-200 dark:border-zinc-800">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={previewUrl} alt="Preview" className="w-full h-auto max-h-[200px] object-cover" />
                  <Button 
                    type="button"
                    variant="destructive" 
                    size="icon" 
                    className="absolute top-2 right-2 h-8 w-8 rounded-full"
                    onClick={removeFile}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div 
                  className="border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-lg p-6 flex flex-col items-center justify-center text-zinc-500 cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <UploadCloud className="h-8 w-8 mb-2 text-zinc-400" />
                  <p className="text-sm">คลิกเพื่ออัปโหลดรูปภาพ (สูงสุด 5MB)</p>
                  <p className="text-xs text-zinc-400 mt-1">PNG, JPG, GIF</p>
                </div>
              )}
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*"
                onChange={handleFileChange}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
              ยกเลิก
            </Button>
            <Button type="submit" disabled={isLoading} className="bg-amber-500 hover:bg-amber-600">
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              ส่งข้อมูล
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
