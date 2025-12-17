import { useState, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Search,
  ArrowLeft,
  Upload,
  Download,
  Trash2,
  FileText,
  Image,
  File,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { useToast } from "@hooks/useToast";
import { PatientFile } from "@/domain/model/patient";


const PatientFiles = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const patientIdFilter = searchParams.get("patient");
  const { toast } = useToast();

  const [files, setFiles] = useState<PatientFile[]>(mockPatientFiles);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("other");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredFiles = files.filter((file) => {
    const matchesSearch =
      file.fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      file.patientName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      categoryFilter === "all" || file.category === categoryFilter;
    const matchesPatient =
      !patientIdFilter || file.patientId === patientIdFilter;
    return matchesSearch && matchesCategory && matchesPatient;
  });

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      exam: "Exame",
      report: "Laudo",
      prescription: "Receita",
      other: "Outro",
    };
    return labels[category] || category;
  };

  const getCategoryVariant = (category: string) => {
    const variants: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
      exam: "default",
      report: "secondary",
      prescription: "outline",
      other: "secondary",
    };
    return variants[category] || "secondary";
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.includes("image")) return <Image className="h-4 w-4" />;
    if (fileType.includes("pdf")) return <FileText className="h-4 w-4" />;
    return <File className="h-4 w-4" />;
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleUpload = () => {
    if (!selectedFile || !selectedPatient) {
      toast({
        title: "Erro",
        description: "Selecione um paciente e um arquivo.",
        variant: "destructive",
      });
      return;
    }

    const patient = mockPatients.find((p) => p.id === selectedPatient);
    if (!patient) return;

    const newFile: PatientFile = {
      id: String(files.length + 1),
      patientId: selectedPatient,
      patientName: patient.name,
      fileName: selectedFile.name,
      fileType: selectedFile.type,
      fileSize: `${(selectedFile.size / 1024).toFixed(0)} KB`,
      uploadedAt: new Date().toISOString().split("T")[0],
      category: selectedCategory as PatientFile["category"],
    };

    setFiles([newFile, ...files]);
    setIsUploadDialogOpen(false);
    setSelectedFile(null);
    setSelectedPatient("");
    setSelectedCategory("other");

    toast({
      title: "Arquivo anexado",
      description: `${selectedFile.name} foi anexado com sucesso.`,
    });
  };

  const handleDownload = (file: PatientFile) => {
    toast({
      title: "Download",
      description: `Baixando ${file.fileName}...`,
    });
  };

  const handleDelete = (fileId: string) => {
    setFiles(files.filter((f) => f.id !== fileId));
    toast({
      title: "Arquivo removido",
      description: "O arquivo foi removido com sucesso.",
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR");
  };

  const currentPatient = patientIdFilter
    ? mockPatients.find((p) => p.id === patientIdFilter)
    : null;

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              {currentPatient
                ? `Arquivos de ${currentPatient.name}`
                : "Arquivos dos Pacientes"}
            </h1>
            <p className="text-muted-foreground">
              Gerencie os arquivos anexados aos prontuários
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 mb-6">
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome do arquivo ou paciente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas categorias</SelectItem>
              <SelectItem value="exam">Exames</SelectItem>
              <SelectItem value="report">Laudos</SelectItem>
              <SelectItem value="prescription">Receitas</SelectItem>
              <SelectItem value="other">Outros</SelectItem>
            </SelectContent>
          </Select>

          <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Upload className="h-4 w-4 mr-2" />
                Anexar Arquivo
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Anexar novo arquivo</DialogTitle>
                <DialogDescription>
                  Selecione o paciente, categoria e o arquivo a ser anexado.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="patient">Paciente</Label>
                  <Select
                    value={selectedPatient}
                    onValueChange={setSelectedPatient}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o paciente" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockPatients.map((patient) => (
                        <SelectItem key={patient.id} value={patient.id}>
                          {patient.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Categoria</Label>
                  <Select
                    value={selectedCategory}
                    onValueChange={setSelectedCategory}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="exam">Exame</SelectItem>
                      <SelectItem value="report">Laudo</SelectItem>
                      <SelectItem value="prescription">Receita</SelectItem>
                      <SelectItem value="other">Outro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="file">Arquivo</Label>
                  <div className="flex gap-2">
                    <Input
                      type="text"
                      readOnly
                      value={selectedFile?.name || "Nenhum arquivo selecionado"}
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      Escolher
                    </Button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      onChange={handleFileSelect}
                      className="hidden"
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    />
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsUploadDialogOpen(false)}
                >
                  Cancelar
                </Button>
                <Button onClick={handleUpload}>Anexar</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="bg-card rounded-lg border shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Arquivo</TableHead>
                <TableHead>Paciente</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Tamanho</TableHead>
                <TableHead>Data Upload</TableHead>
                <TableHead className="text-center">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredFiles.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <p className="text-muted-foreground">
                      Nenhum arquivo encontrado
                    </p>
                  </TableCell>
                </TableRow>
              ) : (
                filteredFiles.map((file) => (
                  <TableRow key={file.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getFileIcon(file.fileType)}
                        <span className="font-medium">{file.fileName}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage 
                            src={mockPatients.find(p => p.id === file.patientId)?.avatar} 
                            alt={file.patientName} 
                          />
                          <AvatarFallback>
                            {file.patientName.split(" ").map(n => n[0]).join("").slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <span>{file.patientName}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getCategoryVariant(file.category)}>
                        {getCategoryLabel(file.category)}
                      </Badge>
                    </TableCell>
                    <TableCell>{file.fileSize}</TableCell>
                    <TableCell>{formatDate(file.uploadedAt)}</TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDownload(file)}
                          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(file.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default PatientFiles;