import { createClient } from '@supabase/supabase-js'

// Initialize the Supabase client
export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL || '',
  import.meta.env.VITE_SUPABASE_ANON_KEY || ''
)

// User-related functions
export const getUsers = async () => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('name')
    
    if (error) throw error
    return data
  } catch (error) {
    console.error('Error fetching users:', error)
    throw error
  }
}

// Group-related functions
export const getGroups = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('group_members')
      .select(`
        group_id,
        groups:group_id (
          id,
          name,
          description,
          created_at,
          created_by
        )
      `)
      .eq('user_id', userId)
    
    if (error) throw error
    
    // Extract the groups from the nested structure
    return data.map(item => item.groups)
  } catch (error) {
    console.error('Error fetching groups:', error)
    throw error
  }
}

export const getGroupById = async (groupId) => {
  try {
    const { data, error } = await supabase
      .from('groups')
      .select('*')
      .eq('id', groupId)
      .single()
    
    if (error) throw error
    return data
  } catch (error) {
    console.error('Error fetching group:', error)
    throw error
  }
}

export const getGroupMembers = async (groupId) => {
  try {
    const { data, error } = await supabase
      .from('group_members')
      .select(`
        user_id,
        role,
        joined_at,
        profiles:user_id (
          id,
          name,
          avatar_url
        )
      `)
      .eq('group_id', groupId)
    
    if (error) throw error
    
    // Format the data to be more usable
    return data.map(member => ({
      userId: member.user_id,
      role: member.role,
      joinedAt: member.joined_at,
      profile: member.profiles
    }))
  } catch (error) {
    console.error('Error fetching group members:', error)
    throw error
  }
}

export const createGroup = async (groupData, creatorId) => {
  try {
    // First, create the group
    const { data: group, error: groupError } = await supabase
      .from('groups')
      .insert([
        {
          name: groupData.name,
          description: groupData.description,
          created_by: creatorId
        }
      ])
      .select()
    
    if (groupError) throw groupError
    
    const groupId = group[0].id
    
    // Then, add the creator as a member with admin role
    const { error: memberError } = await supabase
      .from('group_members')
      .insert([
        {
          group_id: groupId,
          user_id: creatorId,
          role: 'admin'
        }
      ])
    
    if (memberError) throw memberError
    
    // If there are initial members, add them too
    if (groupData.members && groupData.members.length > 0) {
      const memberInserts = groupData.members.map(memberId => ({
        group_id: groupId,
        user_id: memberId,
        role: 'member'
      }))
      
      const { error: batchMemberError } = await supabase
        .from('group_members')
        .insert(memberInserts)
      
      if (batchMemberError) throw batchMemberError
    }
    
    return group[0]
  } catch (error) {
    console.error('Error creating group:', error)
    throw error
  }
}

export const addGroupMember = async (groupId, userId, role = 'member') => {
  try {
    const { data, error } = await supabase
      .from('group_members')
      .insert([
        {
          group_id: groupId,
          user_id: userId,
          role
        }
      ])
      .select()
    
    if (error) throw error
    return data[0]
  } catch (error) {
    console.error('Error adding group member:', error)
    throw error
  }
}

export const removeGroupMember = async (groupId, userId) => {
  try {
    const { error } = await supabase
      .from('group_members')
      .delete()
      .eq('group_id', groupId)
      .eq('user_id', userId)
    
    if (error) throw error
    return true
  } catch (error) {
    console.error('Error removing group member:', error)
    throw error
  }
}

// Message-related functions
export const savePrivateMessage = async (message) => {
  try {
    const { data, error } = await supabase
      .from('messages')
      .insert([
        {
          sender_id: message.senderId,
          recipient_id: message.recipientId,
          content: message.content,
          metadata: message.metadata || {}
        }
      ])
      .select()
    
    if (error) throw error
    return data[0]
  } catch (error) {
    console.error('Error saving private message:', error)
    throw error
  }
}

export const saveGroupMessage = async (message) => {
  try {
    const { data, error } = await supabase
      .from('group_messages')
      .insert([
        {
          sender_id: message.senderId,
          group_id: message.groupId,
          content: message.content,
          metadata: message.metadata || {}
        }
      ])
      .select()
    
    if (error) throw error
    return data[0]
  } catch (error) {
    console.error('Error saving group message:', error)
    throw error
  }
}