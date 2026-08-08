import PermissionFormComp from "@/components/Dashboard/AccessControlPage/PermissionFormComp";


const NewPermissionPage = () => {
  return (
    <div className="p-6 max-w-2xl mx-auto">
      <PermissionFormComp mode="create" />
    </div>
  );
};

export default NewPermissionPage;